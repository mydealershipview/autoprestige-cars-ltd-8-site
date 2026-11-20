// @vitest-environment node
import { describe, expect, it } from 'vitest'
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
