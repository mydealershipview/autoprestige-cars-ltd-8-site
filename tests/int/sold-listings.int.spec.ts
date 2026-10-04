import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import type { AutoTraderVehicle } from '@/utilities/autotrader'
import { GET } from '@/app/api/sold-listings/route'

const mocks = vi.hoisted(() => ({
  read: vi.fn(),
  sync: vi.fn(),
  merge: vi.fn(),
  after: vi.fn(),
}))

vi.mock('next/server', async (importOriginal) => ({
  ...await importOriginal<typeof import('next/server')>(),
  after: mocks.after,
}))
vi.mock('@/lib/services/soldCars.service', () => ({
  getVisibleSoldCarVehicles: mocks.read,
  syncSoldCarsFromDMS: mocks.sync,
  refreshSoldCarsIfStale: mocks.sync,
}))
vi.mock('@/utilities/mergePayloadData', () => ({ mergeVehiclesWithPayloadData: mocks.merge }))

function vehicle(stockId: string, make: string, price: number): AutoTraderVehicle {
  return {
    vehicle: { make, model: 'Test model', standard: {} },
    metadata: { stockId, dateOnForecourt: '2026-10-01T00:00:00Z' },
    adverts: { forecourtPrice: { amountGBP: price } },
  } as AutoTraderVehicle
}

describe('public sold listings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.read.mockResolvedValue([vehicle('saved-1', 'BMW', 12000)])
    mocks.merge.mockImplementation(async (cars) => cars)
    mocks.sync.mockResolvedValue(undefined)
  })

  it('returns saved cars without waiting for a slow stock feed', async () => {
    mocks.sync.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))
    const started = performance.now()
    const response = await GET(new NextRequest('http://localhost/api/sold-listings'))
    const elapsed = performance.now() - started
    console.info(`Sold listings response with a 100ms stock sync: ${elapsed.toFixed(1)}ms`)
    expect((await response.json()).results[0].metadata.stockId).toBe('saved-1')
    expect(mocks.sync).not.toHaveBeenCalled()
    expect(mocks.after).toHaveBeenCalledOnce()
  })

  it('refreshes after the response and keeps feed failures out of the public response', async () => {
    mocks.sync.mockRejectedValue(new Error('Stock feed unavailable'))
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const response = await GET(new NextRequest('http://localhost/api/sold-listings'))
      expect(response.status).toBe(200)
      await expect(mocks.after.mock.calls[0][0]()).resolves.toBeUndefined()
      expect(mocks.sync).toHaveBeenCalledOnce()
      expect(log).toHaveBeenCalled()
    } finally {
      log.mockRestore()
    }
  })

  it('preserves filters, sorting, pagination, and dealer overrides', async () => {
    mocks.read.mockResolvedValue([
      vehicle('bmw-low', 'BMW', 12000),
      vehicle('audi', 'Audi', 15000),
      vehicle('bmw-high', 'BMW', 18000),
    ])
    mocks.merge.mockImplementation(async (cars: AutoTraderVehicle[]) => cars.map((car) => ({
      ...car,
      adverts: { ...car.adverts, forecourtPrice: { amountGBP: 11995 } },
    })))
    const response = await GET(new NextRequest(
      'http://localhost/api/sold-listings?make=BMW&sortBy=price&sortOrder=desc&page=2&pageSize=1',
    ))
    const data = await response.json()
    expect(data.totalResults).toBe(2)
    expect(data.results[0].metadata.stockId).toBe('bmw-low')
    expect(data.results[0].adverts.forecourtPrice.amountGBP).toBe(11995)
    expect(data.availableMakes.map((make: { name: string }) => make.name)).toEqual(['Audi', 'BMW'])
  })

  it('reads current visibility settings on each request', async () => {
    const request = () => new NextRequest('http://localhost/api/sold-listings')
    expect((await (await GET(request())).json()).totalResults).toBe(1)
    mocks.read.mockResolvedValue([])
    expect((await (await GET(request())).json()).totalResults).toBe(0)
    expect(mocks.merge).toHaveBeenCalledOnce()
  })

  it('rejects invalid pagination without scheduling a refresh', async () => {
    const response = await GET(new NextRequest('http://localhost/api/sold-listings?page=0'))
    expect(response.status).toBe(400)
    expect(mocks.read).not.toHaveBeenCalled()
    expect(mocks.after).not.toHaveBeenCalled()
  })
})
