import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ read: vi.fn(), inventory: vi.fn(), legacy: vi.fn(), merge: vi.fn() }))
vi.mock('@/lib/services/dmsWebsiteStock', () => ({ getDmsWebsiteVehicles: mocks.read, getDmsWebsiteInventoryVehicles: mocks.inventory }))
vi.mock('@/lib/services/legacySoldCars', () => ({ readLegacySoldCars: mocks.legacy }))
vi.mock('@/utilities/mergePayloadData', () => ({ mergeVehiclesWithPayloadData: mocks.merge }))
import { GET } from '@/app/api/sold-listings/route'
import { getSoldCarVehicleByStockId } from '@/lib/services/soldCars.service'
import { GET as oldAdminGET, PATCH as oldAdminPATCH } from '@/app/api/sold-cars/route'

const car = (stockId: string, make: string, price: number, soldAt = '2026-10-01T12:00:00Z') => ({
  vehicle: { registration: '', make, model: 'Test model', colour: 'Blue', derivative: 'Stage 2', yearOfManufacture: 2020, odometerReadingMiles: 15000, standard: {} },
  metadata: { stockId, lifecycleState: 'SOLD' }, soldAt,
  adverts: { forecourtPrice: { amountGBP: price } }, media: {images:[]},
})
type CarFixture = ReturnType<typeof car>
beforeEach(() => { vi.clearAllMocks(); mocks.legacy.mockResolvedValue([]); mocks.inventory.mockResolvedValue([]); mocks.read.mockImplementation(async kind => kind === 'sold' ? [
  car('bmw-low', 'BMW', 12000), car('audi', 'Audi', 15000), car('bmw-high', 'BMW', 18000, '2026-10-02T12:00:00Z'),
] : []) })
afterEach(() => vi.restoreAllMocks())
const get = (query = '') => GET(new NextRequest(`http://localhost/api/sold-listings?${query}`))

describe('public sold listings managed by DMS', () => {
  it('keeps filters, sorting, pagination, all make options and public prices', async () => {
    const data = await (await get('make=BMW&sortBy=price&sortOrder=desc&page=2&pageSize=1')).json()
    expect(data.totalResults).toBe(2)
    expect(data.results[0].metadata.stockId).toBe('bmw-low')
    expect(data.results[0].adverts.forecourtPrice.amountGBP).toBe(12000)
    expect(data.availableMakes.map((m: {name:string})=>m.name)).toEqual(['Audi','BMW'])
    expect(mocks.merge).not.toHaveBeenCalled()
  })
  it('orders by sale date and keeps selected cars older than 30 days', async () => {
    const data = await (await get()).json()
    expect(data.results[0].metadata.stockId).toBe('bmw-high')
    mocks.read.mockResolvedValue([car('retained', 'BMW', 10000, '2025-01-01T00:00:00Z')])
    expect((await (await get()).json()).results[0].metadata.stockId).toBe('retained')
  })
  it('preserves numeric ranges and literal free-text search', async () => {
    expect((await (await get('minPrice=13000&maxPrice=19000&colour=blue&search=stage%202')).json()).totalResults).toBe(2)
    expect((await (await get('search=%5B')).json()).totalResults).toBe(0)
    expect((await (await get('minMileage=16000')).json()).totalResults).toBe(0)
  })
  it('empty means the authoritative DMS feed is empty, including toggle off', async () => {
    expect((await (await get()).json()).totalResults).toBe(3)
    mocks.read.mockResolvedValue([])
    expect((await (await get()).json()).totalResults).toBe(0)
    expect(await getSoldCarVehicleByStockId('bmw-high')).toBeNull()
  })
  it('detail lookup uses only DMS-selected sold cars', async () => {
    expect((await getSoldCarVehicleByStockId('bmw-high'))?.metadata.stockId).toBe('bmw-high')
    expect(await getSoldCarVehicleByStockId('old-archive-only')).toBeNull()
  })
  it('upstream failure is a generic error, never an empty showroom', async () => {
    mocks.read.mockRejectedValue(new Error('secret provider details'))
    vi.spyOn(console, 'error').mockImplementation(()=>{})
    const result = await get()
    expect(result.status).toBe(500)
    expect(JSON.stringify(await result.json())).not.toContain('secret provider')
  })
  it.each(['page=0','page=1.5','page=abc','pageSize=101','sortOrder=sideways'])('rejects %s before reading stock', async query => {
    expect((await get(query)).status).toBe(400)
    expect(mocks.read).not.toHaveBeenCalled()
  })
  it('adds the full legacy archive and globally filters, sorts and pages the union', async () => {
    mocks.legacy.mockResolvedValue(Array.from({ length: 25 }, (_, i) => car(`legacy-${i}`, 'BMW', 1000 + i)))
    const first = await (await get('make=BMW&sortBy=price&sortOrder=asc&pageSize=20')).json()
    const second = await (await get('make=BMW&sortBy=price&sortOrder=asc&pageSize=20&page=2')).json()
    expect(first.totalResults).toBe(27)
    expect(first.results).toHaveLength(20)
    expect(second.results).toHaveLength(7)
    expect(new Set([...first.results, ...second.results].map((car: CarFixture) => car.metadata.stockId)).size).toBe(27)
    expect(second.results.at(-1).metadata.stockId).toBe('bmw-high')
    expect((await (await get('page=999&pageSize=20')).json()).page).toBe(2)
    expect((await getSoldCarVehicleByStockId('legacy-0'))?.metadata.stockId).toBe('legacy-0')
  })
  it('prefers DMS and never revives a managed unselected sold or currently listed car from Mongo', async () => {
    mocks.inventory.mockResolvedValue([car('bmw-high', 'BMW', 1), car('off', 'Audi', 2)])
    mocks.read.mockImplementation(async kind => kind === 'live' ? [car('live', 'BMW', 3)] : [car('bmw-high', 'BMW', 18000)])
    mocks.legacy.mockResolvedValue([car('bmw-high', 'BMW', 1), car('off', 'Audi', 2), car('live', 'BMW', 3), car('legacy', 'Ford', 4)])
    const data = await (await get()).json()
    expect(data.results.map((car: CarFixture) => car.metadata.stockId).sort()).toEqual(['bmw-high', 'legacy'])
    expect(data.results.find((car: CarFixture) => car.metadata.stockId === 'bmw-high').adverts.forecourtPrice.amountGBP).toBe(18000)
  })
  it('deduplicates registrations despite whitespace, changed stock ID and case', async () => {
    const current = car('new', 'BMW', 3); current.vehicle.registration = 'AB12 CDE'
    const old = car('old', 'BMW', 2); old.vehicle.registration = 'ab12cde'
    mocks.inventory.mockResolvedValue([current]); mocks.legacy.mockResolvedValue([old])
    expect((await (await get()).json()).results.some((car: CarFixture) => car.metadata.stockId === 'old')).toBe(false)
  })
  it('fails visibly when Mongo is unavailable rather than returning a partial total', async () => {
    mocks.legacy.mockRejectedValue(new Error('Mongo unavailable'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await get()).status).toBe(500)
  })
  it.each(['minPrice=abc', 'minPrice=1x', 'minPrice=-1', 'minYear=2022&maxYear=2020', 'maxMileage=Infinity'])('rejects invalid range %s', async query => {
    expect((await get(query)).status).toBe(400)
    expect(mocks.read).not.toHaveBeenCalled()
  })
  it('retires the separate website sold-ad administration', async () => {
    expect(oldAdminGET().status).toBe(410)
    expect(oldAdminPATCH().status).toBe(410)
  })
})
