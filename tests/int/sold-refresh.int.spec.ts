import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  bulkWrite: vi.fn(),
  autoTrader: vi.fn(),
}))
vi.mock('@/lib/db/connect', () => ({ default: mocks.connect }))
vi.mock('@/lib/db/models/soldCar.model', () => ({ default: { bulkWrite: mocks.bulkWrite } }))
vi.mock('@/utilities/autotrader', () => ({ fetchAutoTraderListings: mocks.autoTrader }))

function feedResponse() {
  return new Response(JSON.stringify({ data: {
    vehicles: [{
      vehicle: { make: 'BMW', model: '320d' },
      metadata: { stockId: 'sold-1', lifecycleState: 'SOLD' },
    }],
    pagination: { totalResults: 1 },
  } }))
}

describe('background sold-car refresh', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-04T12:00:00Z'))
    mocks.connect.mockResolvedValue(undefined)
    mocks.bulkWrite.mockResolvedValue({ modifiedCount: 1 })
    vi.stubGlobal('fetch', vi.fn(async () => feedResponse()))
    vi.stubEnv('DMS_URL', 'https://feed.example/stock')
    vi.stubEnv('DEALER_EMAIL', 'dealer@example.com')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('shares one sync across concurrent requests and skips repeated archive writes', async () => {
    let resolveFeed!: (response: Response) => void
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { resolveFeed = resolve }))
    vi.stubGlobal('fetch', fetchMock)
    const { refreshSoldCarsIfStale } = await import('@/lib/services/soldCars.service')
    const requests = [refreshSoldCarsIfStale(), refreshSoldCarsIfStale(), refreshSoldCarsIfStale()]
    expect(fetchMock).toHaveBeenCalledOnce()
    resolveFeed(feedResponse())
    await Promise.all(requests)
    expect(mocks.bulkWrite).toHaveBeenCalledOnce()
    await refreshSoldCarsIfStale()
    expect(mocks.bulkWrite).toHaveBeenCalledOnce()
  })

  it('refreshes the feed again after five minutes', async () => {
    const { refreshSoldCarsIfStale } = await import('@/lib/services/soldCars.service')
    await refreshSoldCarsIfStale()
    vi.advanceTimersByTime(5 * 60 * 1000)
    await refreshSoldCarsIfStale()
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(mocks.bulkWrite).toHaveBeenCalledTimes(2)
  })

  it('backs off after a database write failure and allows a later retry', async () => {
    mocks.bulkWrite.mockRejectedValueOnce(new Error('Database temporarily unavailable'))
    const { refreshSoldCarsIfStale } = await import('@/lib/services/soldCars.service')
    await expect(refreshSoldCarsIfStale()).rejects.toThrow('Database temporarily unavailable')
    await refreshSoldCarsIfStale()
    expect(mocks.bulkWrite).toHaveBeenCalledOnce()
    vi.advanceTimersByTime(5 * 60 * 1000)
    await refreshSoldCarsIfStale()
    expect(mocks.bulkWrite).toHaveBeenCalledTimes(2)
  })
})
