import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function car(id: string, state = 'SOLD') {
  return { vehicle: { make: 'BMW', model: '320d' }, metadata: { stockId: id, lifecycleState: state },
    lifecycleState: state, adverts: { forecourtPrice: { amountGBP: 12000 }, retailAdverts: { advertiserAdvert: { status: 'PUBLISHED' } } },
    media: { images: [{ href: 'https://m.atcdn.co.uk/{resize}/photo.jpg' }] }, soldAt: '2026-10-01T12:00:00Z' }
}
const response = (vehicles = [car('sold-1')], totalPages = 1) => Response.json({ success: true, data: {
  vehicles, pagination: { totalPages, totalResults: vehicles.length },
} })

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('DMS_URL', 'https://feed.example/api/website/stock')
  vi.stubEnv('DEALER_EMAIL', 'dealer+test@example.com')
  vi.stubGlobal('fetch', vi.fn(async () => response()))
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-12T12:00:00Z'))
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs() })

describe('DMS website feed reader', () => {
  it('uses status=sold, an encoded dealer and our own photos, with no archive write', async () => {
    const { getDmsWebsiteVehicles } = await import('@/lib/services/dmsWebsiteStock')
    const vehicles = await getDmsWebsiteVehicles('sold')
    const url = new URL(String(vi.mocked(fetch).mock.calls.find(call => new URL(String(call[0])).searchParams.get('status') === 'sold')![0]))
    expect(url.searchParams.get('status')).toBe('sold')
    expect(url.searchParams.get('includeReserved')).toBeNull()
    expect(url.searchParams.get('dealerEmail')).toBe('dealer+test@example.com')
    expect(vehicles[0].media.images[0].href).not.toContain('{resize}')
    expect(vi.mocked(fetch).mock.calls[0][1]?.cache).toBe('no-store')
  })
  it('coalesces concurrent reads and expires the shared bundle after 30 seconds, including removals', async () => {
    const { getDmsWebsiteVehicles } = await import('@/lib/services/dmsWebsiteStock')
    await Promise.all([getDmsWebsiteVehicles('sold'), getDmsWebsiteVehicles('sold'), getDmsWebsiteVehicles('live')])
    expect(fetch).toHaveBeenCalledTimes(3)
    vi.mocked(fetch).mockImplementation(async () => response([], 0))
    expect(await getDmsWebsiteVehicles('sold')).toHaveLength(1)
    expect(fetch).toHaveBeenCalledTimes(3)
    vi.setSystemTime(new Date('2026-10-12T12:00:31Z'))
    expect(await getDmsWebsiteVehicles('sold')).toEqual([])
    expect(fetch).toHaveBeenCalledTimes(6)
  })
  it('requests all pages in bounded batches, deduplicating stock IDs', async () => {
    vi.mocked(fetch).mockImplementation(async url => {
      const page = new URL(String(url)).searchParams.get('page')
      return response([car(page === '1' ? 'first' : 'second')], 3)
    })
    const { getDmsWebsiteVehicles } = await import('@/lib/services/dmsWebsiteStock')
    expect((await getDmsWebsiteVehicles('sold')).map(v => v.metadata.stockId)).toEqual(['first', 'second'])
    expect(fetch).toHaveBeenCalledTimes(9)
  })
  it('keeps unpublished sale-in-progress cars but excludes sold and unpublished ordinary cars', async () => {
    const hidden = car('hidden', 'FORECOURT'); hidden.adverts.retailAdverts.advertiserAdvert.status = 'NOT_PUBLISHED'
    const removedReserved = car('removed-reserved', 'SALE_IN_PROGRESS'); removedReserved.adverts.retailAdverts.advertiserAdvert.status = 'NOT_PUBLISHED'
    vi.mocked(fetch).mockImplementation(async () => response([car('live', 'FORECOURT'), car('reserved', 'SALE_IN_PROGRESS'), removedReserved, car('sold'), hidden]))
    const { getDmsWebsiteVehicles } = await import('@/lib/services/dmsWebsiteStock')
    expect((await getDmsWebsiteVehicles('live')).map(v => v.metadata.stockId)).toEqual(['live', 'reserved', 'removed-reserved'])
    expect(new URL(String(vi.mocked(fetch).mock.calls[0][0])).searchParams.get('includeReserved')).toBe('true')
  })
  it('never serves an expired archive or empty success on upstream failure and retries', async () => {
    const { getDmsWebsiteVehicles } = await import('@/lib/services/dmsWebsiteStock')
    await getDmsWebsiteVehicles('sold')
    vi.setSystemTime(new Date('2026-10-12T12:01:01Z'))
    vi.mocked(fetch).mockResolvedValueOnce(new Response('secret provider details', { status: 500 }))
    await expect(getDmsWebsiteVehicles('sold')).rejects.toThrow('unavailable')
    vi.mocked(fetch).mockImplementation(async () => response([], 0))
    expect(await getDmsWebsiteVehicles('sold')).toEqual([])
  })
  it('does not cache incomplete pagination or accept malformed envelopes', async () => {
    const { getDmsWebsiteVehicles } = await import('@/lib/services/dmsWebsiteStock')
    vi.mocked(fetch).mockResolvedValueOnce(response([car('partial')], 2)).mockResolvedValueOnce(new Response('', {status:500}))
    await expect(getDmsWebsiteVehicles('sold')).rejects.toThrow()
    vi.mocked(fetch).mockImplementation(async () => Response.json({ data: { vehicles: [] } }))
    await expect(getDmsWebsiteVehicles('sold')).rejects.toThrow('Invalid')
  })
  it('retains detached Reserved adverts after AutoTrader removes the car and prefers snapshots over live duplicates', async () => {
    const kept = { ...car('websitead123', 'SALE_IN_PROGRESS'), websiteOnly: true, reserved: true, sourceStockId: 'live' }
    vi.mocked(fetch).mockImplementation(async url => new URL(String(url)).pathname.endsWith('/reserved-ads') ? response([kept]) : response([car('live', 'FORECOURT'), car('other', 'FORECOURT')]))
    const { getDmsWebsiteVehicles } = await import('@/lib/services/dmsWebsiteStock')
    expect((await getDmsWebsiteVehicles('live')).map(v => v.metadata.stockId)).toEqual(['other', 'websitead123'])
    vi.setSystemTime(new Date('2026-10-12T12:01:01Z'))
    vi.mocked(fetch).mockImplementation(async url => new URL(String(url)).pathname.endsWith('/reserved-ads') ? response([kept]) : response([], 0))
    expect((await getDmsWebsiteVehicles('live'))[0]).toMatchObject({ websiteOnly: true, reserved: true })
    vi.setSystemTime(new Date('2026-10-12T12:02:02Z'))
    vi.mocked(fetch).mockImplementation(async () => response([], 0))
    expect(await getDmsWebsiteVehicles('live')).toEqual([])
  })
  it('does not silently lose retained adverts when their feed is unavailable', async () => {
    vi.mocked(fetch).mockImplementation(async url => new URL(String(url)).pathname.endsWith('/reserved-ads') ? new Response('', { status: 500 }) : response([car('live', 'FORECOURT')]))
    const { getDmsWebsiteVehicles } = await import('@/lib/services/dmsWebsiteStock')
    await expect(getDmsWebsiteVehicles('live')).rejects.toThrow('unavailable')
  })

  it('keeps a vehicle in one place even when upstream responses straddle a mode change', async () => {
    const kept = { ...car('websitead123', 'SALE_IN_PROGRESS'), websiteOnly: true, reserved: true, sourceStockId: 'car' }
    vi.mocked(fetch).mockImplementation(async url => {
      const parsed = new URL(String(url))
      return parsed.pathname.endsWith('/reserved-ads') ? response([kept]) : parsed.searchParams.get('status') === 'sold' ? response([car('car')]) : response([car('car', 'FORECOURT')])
    })
    const { getDmsWebsiteVehicles } = await import('@/lib/services/dmsWebsiteStock')
    expect(await getDmsWebsiteVehicles('live')).toEqual([])
    expect((await getDmsWebsiteVehicles('sold')).map(v => v.metadata.stockId)).toEqual(['car'])
    expect(fetch).toHaveBeenCalledTimes(3)
    vi.setSystemTime(new Date('2026-10-12T12:01:01Z'))
    vi.mocked(fetch).mockImplementation(async url => new URL(String(url)).pathname.endsWith('/reserved-ads') ? response([kept]) : response([], 0))
    expect((await getDmsWebsiteVehicles('live')).map(v => v.metadata.stockId)).toEqual(['websitead123'])
    expect(await getDmsWebsiteVehicles('sold')).toEqual([])
  })

})
