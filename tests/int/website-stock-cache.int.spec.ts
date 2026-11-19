import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const car = (id: string, state = 'FORECOURT') => ({ vehicle: { make: 'BMW', model: '320d' }, metadata: { stockId: id, lifecycleState: state },
  lifecycleState: state, adverts: { forecourtPrice: { amountGBP: 12000 }, retailAdverts: { advertiserAdvert: { status: 'PUBLISHED' } } }, media: { images: [] } })
const respond = (vehicles: unknown[]) => Response.json({ success: true, data: { vehicles, pagination: { totalPages: vehicles.length ? 1 : 0, totalResults: vehicles.length } } })

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('DMS_WEBSITE_KEY', 'test-website-key'); vi.stubEnv('DMS_URL', 'https://feed.example/api/website/stock'); vi.stubEnv('DEALER_EMAIL', 'dealer@example.com')
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-28T10:00:00Z'))
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs() })

describe('default stock caching', () => {
  it('reads the feeds once for 5 minutes, then serves the last stock while refreshing, and never serves stock older than 15 minutes', async () => {
    const fetchMock = vi.fn(async (input: unknown) => respond(new URL(String(input)).searchParams.get('status') === 'sold' ? [] : [car('a')]))
    vi.stubGlobal('fetch', fetchMock)
    const { getDmsWebsiteVehicles } = await import('@/lib/services/dmsWebsiteStock')
    await getDmsWebsiteVehicles('live'); await getDmsWebsiteVehicles('live')
    const firstRead = fetchMock.mock.calls.length
    vi.setSystemTime(new Date('2026-10-28T10:04:30Z'))
    await getDmsWebsiteVehicles('live')
    expect(fetchMock).toHaveBeenCalledTimes(firstRead)
    // After 5 minutes the old stock is returned at once while one refresh runs behind the request.
    fetchMock.mockImplementation(async (input: unknown) => respond(new URL(String(input)).searchParams.get('status') === 'sold' ? [] : [car('b')]))
    vi.setSystemTime(new Date('2026-10-28T10:05:30Z'))
    expect((await getDmsWebsiteVehicles('live')).map(v => v.metadata.stockId)).toEqual(['a'])
    await vi.waitFor(async () => expect((await getDmsWebsiteVehicles('live')).map(v => v.metadata.stockId)).toEqual(['b']))
    expect(fetchMock.mock.calls.length).toBe(firstRead * 2)
    // A failing DMS keeps the last good stock for a while, but not beyond 15 minutes.
    fetchMock.mockImplementation(async () => new Response('{}', { status: 503 }))
    vi.setSystemTime(new Date('2026-10-28T10:12:00Z'))
    expect((await getDmsWebsiteVehicles('live')).map(v => v.metadata.stockId)).toEqual(['b'])
    vi.setSystemTime(new Date('2026-10-28T10:25:00Z'))
    await expect(getDmsWebsiteVehicles('live')).rejects.toThrow()
  })
})
