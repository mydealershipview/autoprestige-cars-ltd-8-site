// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { WebsiteVehicle } from '@/lib/services/dmsWebsiteStock'
import { FEATURED_COUNT, FeaturedStock, pickFeatured } from '@/components/home/FeaturedStock'

const car = (id: string, date: string, price = 20000, photos = 3) =>
  ({
    metadata: { stockId: id, dateOnForecourt: date, lifecycleState: 'FORECOURT' },
    vehicle: { make: 'BMW', model: 'M3', derivative: 'Competition', yearOfManufacture: '2021', odometerReadingMiles: 30000, fuelType: 'Petrol', transmissionType: 'Automatic' },
    adverts: { forecourtPrice: { amountGBP: price } },
    media: { images: Array.from({ length: photos }, (_, n) => ({ href: `https://m.atcdn.co.uk/${id}-${n}.jpg` })) },
  }) as unknown as WebsiteVehicle

describe('homepage latest stock (upgrade spec)', () => {
  it('picks the newest cars first, at most 8', () => {
    const cars = Array.from({ length: 12 }, (_, i) => car(`s${i}`, `2026-11-${String(i + 1).padStart(2, '0')}`))
    const picked = pickFeatured(cars)
    expect(picked).toHaveLength(FEATURED_COUNT)
    expect(picked[0].metadata.stockId).toBe('s11')
    expect(picked[7].metadata.stockId).toBe('s4')
  })
  it('renders cars with links, prices and the full count in the HTML', () => {
    const cars = Array.from({ length: 10 }, (_, i) => car(`s${i}`, `2026-11-${String(i + 1).padStart(2, '0')}`, 25000 + i))
    const html = renderToStaticMarkup(FeaturedStock({ vehicles: cars })!)
    expect(html).toContain('href="/usedcars/bmw-m3-2021-s9"')
    expect(html).toContain('£25,009')
    expect(html.replace(/<!-- -->/g, "")).toMatch(/View all 10 cars/)
    expect(html.match(/<li>/g)).toHaveLength(8)
  })
  it('skips new arrivals with only the "Coming soon" picture; the count still includes them', () => {
    const cars = [car('new', '2026-11-20', 30000, 1), ...Array.from({ length: 5 }, (_, i) => car(`s${i}`, `2026-11-0${i + 1}`))]
    expect(pickFeatured(cars).map((c) => c.metadata.stockId)).not.toContain('new')
    const html = renderToStaticMarkup(FeaturedStock({ vehicles: cars })!).replace(/<!-- -->/g, '')
    expect(html).toMatch(/View all 6 cars/)
  })
  it('hides the section with fewer than 4 photographed cars', () => {
    expect(FeaturedStock({ vehicles: [car('a', '2026-11-01'), car('b', '2026-11-02'), car('c', '2026-11-03')] })).toBeNull()
    expect(FeaturedStock({ vehicles: [car('a', '2026-11-01'), car('b', '2026-11-02'), car('c', '2026-11-03'), car('d', '2026-11-04', 1, 1)] })).toBeNull()
  })
})

describe('homepage featured cars from the DMS rule (Settings > Website)', () => {
  const cars = Array.from({ length: 10 }, (_, i) => car(`s${i}`, `2026-11-${String(i + 1).padStart(2, '0')}`))
  it("keeps the dealer's order, not the newest first", () => {
    expect(pickFeatured(cars, ['s1', 's8', 's3', 's0']).map((c) => c.metadata.stockId)).toEqual(['s1', 's8', 's3', 's0'])
  })
  it('shows up to 12, skips cars not on the Used Cars page or without photos, and matches a Reserved copy by its original ID', () => {
    const reservedCopy = { ...car('web-1', '2026-11-15'), sourceStockId: 'orig-1' } as WebsiteVehicle
    const list = [...cars, car('nophoto', '2026-11-20', 1, 1), reservedCopy]
    const ids = ['gone', 'nophoto', 'orig-1', ...cars.map((c) => c.metadata.stockId)]
    const picked = pickFeatured(list, ids).map((c) => c.metadata.stockId)
    expect(picked).toEqual(['web-1', ...cars.map((c) => c.metadata.stockId)])
    expect(pickFeatured(Array.from({ length: 14 }, (_, i) => car(`p${i}`, '2026-11-01')), Array.from({ length: 14 }, (_, i) => `p${i}`))).toHaveLength(12)
  })
  it('hides the section when the rule finds fewer than 4 (empty list from the DMS)', () => {
    expect(FeaturedStock({ vehicles: cars, featuredIds: [] })).toBeNull()
    expect(FeaturedStock({ vehicles: cars, featuredIds: ['s1', 's2', 's3'] })).toBeNull()
  })
  it('falls back to the newest cars when the featured feed is down', () => {
    expect(pickFeatured(cars, null)).toEqual(pickFeatured(cars))
  })
})

describe('featured feed read', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })
  it('asks the DMS for featured=true with no paging, keeps the order, and caches it', async () => {
    vi.resetModules()
    vi.stubEnv('DMS_WEBSITE_KEY', 'k'); vi.stubEnv('DMS_URL', 'https://feed.example/api/website/stock?pageSize=50'); vi.stubEnv('DEALER_EMAIL', 'd@example.com')
    const fetchMock = vi.fn(async () => Response.json({ success: true, data: { vehicles: [car('b', '2026-11-01'), car('a', '2026-11-02')], pagination: { totalPages: 1 }, featured: { count: 2 } } }))
    vi.stubGlobal('fetch', fetchMock)
    const { getDmsFeaturedStockIds } = await import('@/lib/services/dmsWebsiteStock')
    expect(await getDmsFeaturedStockIds()).toEqual(['b', 'a'])
    expect(await getDmsFeaturedStockIds()).toEqual(['b', 'a'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = new URL(String((fetchMock.mock.calls[0] as unknown[])[0]))
    expect(url.searchParams.get('featured')).toBe('true')
    expect([...url.searchParams.keys()]).toEqual(['featured'])
  })
})
