import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { isLiveListing, isReserved } from '@/utilities/websiteVehicleStatus'
import type { WebsiteVehicle } from '@/lib/services/dmsWebsiteStock'

// Production incident 19 October: both cars are in DMS but were rejected by the site.
const affected = [
  ['7f18e1bb403d48a28a3d2a8d45a5bc52', 'OE67FSX', 'M4'],
  ['8ce6ac662fe141ae9d3a65e53955fe62', 'YO18ZDS', 'M3'],
]
const car = (id = 'car', state = 'FORECOURT', published = 'PUBLISHED') => ({
  stockId: id, lifecycleState: state, metadata: { stockId: id, lifecycleState: state },
  vehicle: { registration: 'AB12CDE', make: 'BMW', model: 'M3', yearOfManufacture: 2018 },
  reserved: state === 'SALE_IN_PROGRESS',
  adverts: { reservationStatus: null, forecourtPrice: { amountGBP: 29990 }, retailAdverts: {
    advertiserAdvert: { status: published }, autotraderAdvert: { status: published },
  } }, media: { images: [{ href: 'https://m.atcdn.co.uk/{resize}/photo.jpg' }] },
}) as unknown as WebsiteVehicle

beforeEach(() => { vi.resetModules(); vi.stubEnv('STOCK_CACHE_SECONDS', '30'); vi.stubEnv('STOCK_MAX_STALE_SECONDS', '30'); vi.stubEnv('DMS_WEBSITE_KEY', 'test-website-key'); vi.stubEnv('DMS_URL', 'https://feed.example/api/website/stock'); vi.stubEnv('DEALER_EMAIL', 'dealer@example.com') })
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

describe('reservation and publication decision matrix', () => {
  it('checks all active lifecycle, publication and independent reservation combinations', () => {
    for (const state of ['FORECOURT', 'SALE_IN_PROGRESS']) {
      for (const published of ['PUBLISHED', 'NOT_PUBLISHED', '', 'UNKNOWN']) {
        for (const signal of ['none', 'derived', 'top', 'nested']) {
          const v = car('matrix', state, published)
          v.reserved = signal === 'derived'
          v.adverts.reservationStatus = signal === 'top' ? 'Reserved' : 'Listed'
          v.adverts.retailAdverts.reservationStatus = signal === 'nested' ? 'Reserved' : 'Listed'
          const reserved = state === 'SALE_IN_PROGRESS' || signal !== 'none'
          expect(isReserved(v), `${state}/${published}/${signal}`).toBe(reserved)
          expect(isLiveListing(v), `${state}/${published}/${signal}`).toBe(reserved || published === 'PUBLISHED')
        }
      }
    }
  })
  it.each(affected)('retains actual incident %s / %s independently of unpublication', (id, registration, model) => {
    const v = car(id, 'SALE_IN_PROGRESS', 'NOT_PUBLISHED'); v.vehicle.registration = registration; v.vehicle.model = model
    expect(isLiveListing(v)).toBe(true); expect(isReserved(v)).toBe(true)
  })
  it.each(['PUBLISHED', 'NOT_PUBLISHED', '', 'UNKNOWN'])('retains SALE_IN_PROGRESS with channel status %s', published => {
    const v = car('car', 'SALE_IN_PROGRESS', published); v.reserved = false
    expect(isLiveListing(v)).toBe(true); expect(isReserved(v)).toBe(true)
  })
  it.each(['SOLD', 'DELETED', 'WASTEBIN', 'IN_PREP', '', 'UNKNOWN'])('does not resurrect %s stock even with Reserved signals', state => {
    const v = car('car', state); v.reserved = true; v.adverts.reservationStatus = 'Reserved'
    expect(isLiveListing(v)).toBe(false)
  })
  it('preserves the unpublished ordinary-car exclusion and its return to published stock', () => {
    const v = car('car', 'FORECOURT', 'NOT_PUBLISHED')
    expect(isLiveListing(v)).toBe(false)
    v.adverts.retailAdverts.advertiserAdvert!.status = 'PUBLISHED'
    expect(isLiveListing(v)).toBe(true); expect(isReserved(v)).toBe(false)
  })
  it('accepts each reservation field independently, including conflicting optional fields', () => {
    for (const field of ['derived', 'top', 'nested']) {
      const v = car('car', 'FORECOURT', 'NOT_PUBLISHED')
      v.reserved = field === 'derived'; v.adverts.reservationStatus = field === 'top' ? ' Reserved ' : 'Listed'
      v.adverts.retailAdverts.reservationStatus = field === 'nested' ? 'Reserved' : 'Listed'
      expect(isLiveListing(v)).toBe(true); expect(isReserved(v)).toBe(true)
    }
  })
  it('supports absent channels, metadata lifecycle and provider casing/whitespace', () => {
    const v = car('car', ' sale_in_progress ', 'NOT_PUBLISHED'); delete v.lifecycleState
    v.adverts = { retailAdverts: {} } as WebsiteVehicle['adverts']
    expect(isLiveListing(v)).toBe(true); expect(isReserved(v)).toBe(true)
    const ordinary = car('plain', ' forecourt ', ' published ')
    expect(isLiveListing(ordinary)).toBe(true)
  })
  it('does not turn a pending selection or disabled website-only advert into a live Reserved listing', () => {
    const v = car('car', 'FORECOURT')
    expect(isLiveListing(v)).toBe(true); expect(isReserved(v)).toBe(false)
    expect(isLiveListing({ ...car('ad', 'SALE_IN_PROGRESS'), websiteOnly: true, reserved: false })).toBe(false)
    expect(isLiveListing({ ...car('ad', 'SOLD', 'NOT_PUBLISHED'), websiteOnly: true, reserved: true })).toBe(true)
  })
})

// Exercise the REAL reader and routes: the previous route tests mocked the reader,
// which let a correct badge test pass while actual eligibility silently dropped the car.
vi.mock('@/utilities/mergePayloadData', () => ({
  mergeVehiclesWithPayloadData: async (cars: unknown) => cars,
  fetchPayloadVehicleData: async () => new Map(), mergeVehicleWithPayloadData: (v: unknown) => v,
  preferDmsAdvertCopy: (_v: unknown, merged: unknown) => merged,
}))
vi.mock('@/utilities/vehicleOverrides', () => ({ fetchOverridesMap: async () => new Map(), applyOverrideToVehicle: (v: unknown) => v }))
vi.mock('@/lib/services/soldCars.service', () => ({ getSoldCarVehicleByStockId: async () => null }))

describe('real reader through listing, detail and homepage routes', () => {
  it('serves both unpublished incident cars in all routes, then removes them when no feed retains them', async () => {
    let live = affected.map(([id, reg, model]) => { const v = car(id, 'SALE_IN_PROGRESS', 'NOT_PUBLISHED'); v.vehicle.registration = reg; v.vehicle.model = model; return v })
    vi.stubGlobal('fetch', vi.fn(async (url: URL) => {
      const u = new URL(String(url)); const vehicles = u.pathname.endsWith('/reserved-ads') || u.searchParams.get('status') === 'sold' ? [] : live
      return Response.json({ success: true, data: { vehicles, pagination: { totalPages: vehicles.length ? 1 : 0 } } })
    }))
    const { GET: list } = await import('@/app/api/listings/route')
    const { GET: detail } = await import('@/app/api/listing/[stockId]/route')
    const { GET: featured } = await import('@/app/api/featured-vehicles/route')
    const listed = await (await list(new NextRequest('http://localhost/api/listings'))).json()
    expect(listed.results.map((v: WebsiteVehicle) => v.vehicle.registration)).toEqual(['OE67FSX', 'YO18ZDS'])
    for (const [stockId] of affected) {
      const response = await detail(new NextRequest('http://localhost/api/listing/' + stockId), { params: Promise.resolve({ stockId }) })
      expect(response.status).toBe(200)
    }
    const home = await (await featured()).json(); expect(home.results).toHaveLength(2)
    live = []
    // Reader intentionally has a bounded 30-second bundle cache; test an expired read.
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 31_000)
    try {
      expect((await (await list(new NextRequest('http://localhost/api/listings'))).json()).results).toEqual([])
      expect((await (await featured()).json()).results).toEqual([])
      for (const [stockId] of affected) {
        expect((await detail(new NextRequest('http://localhost/api/listing/' + stockId), { params: Promise.resolve({ stockId }) })).status).toBe(404)
      }
    }
    finally { vi.restoreAllMocks() }
  })
  it('handles reservation cancellation, re-advertising, sale, both destination switches and toggle-off without duplication', async () => {
    let live: WebsiteVehicle[] = [car()]
    let reserved: WebsiteVehicle[] = []
    let sold: WebsiteVehicle[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: URL) => {
      const u = new URL(String(url)); const vehicles = u.pathname.endsWith('/reserved-ads') ? reserved : u.searchParams.get('status') === 'sold' ? sold : live
      return Response.json({ success: true, data: { vehicles, pagination: { totalPages: vehicles.length ? 1 : 0 } } })
    }))
    const { getDmsWebsiteVehicles } = await import('@/lib/services/dmsWebsiteStock')
    let clock = Date.now()
    const tick = () => { clock += 31_000; vi.spyOn(Date, 'now').mockReturnValue(clock) }
    const lists = () => Promise.all([getDmsWebsiteVehicles('live'), getDmsWebsiteVehicles('sold')])
    try {
      let [showroom, soldPage] = await lists()
      expect(showroom).toHaveLength(1); expect(isReserved(showroom[0])).toBe(false); expect(soldPage).toEqual([])
      live = [car('car', 'SALE_IN_PROGRESS', 'NOT_PUBLISHED')]; tick()
      ;[showroom, soldPage] = await lists()
      expect(showroom).toHaveLength(1); expect(isReserved(showroom[0])).toBe(true); expect(soldPage).toEqual([])
      // Cancellation clears reservation. Publication remains independent.
      live = [car('car', 'FORECOURT', 'NOT_PUBLISHED')]; tick()
      expect(await lists()).toEqual([[], []])
      live = [car()]; tick()
      expect((await lists())[0]).toHaveLength(1)
      // The car is now SOLD but unselected: no archive fallback should revive it.
      live = [car('car', 'SOLD')]; tick()
      expect(await lists()).toEqual([[], []])
      sold = [car('car', 'SOLD')]; tick()
      ;[showroom, soldPage] = await lists()
      expect(showroom).toEqual([]); expect(soldPage).toHaveLength(1)
      reserved = [{ ...car('websitead', 'SALE_IN_PROGRESS', 'NOT_PUBLISHED'), websiteOnly: true, reserved: true, sourceStockId: 'car' }]; tick()
      // Conflicting upstream pages still have at most one effective destination.
      expect((await lists()).map(rows => rows.length)).toEqual([0, 1])
      sold = []; tick()
      expect((await lists()).map(rows => rows.length)).toEqual([1, 0])
      reserved = []; live = []; tick()
      expect(await lists()).toEqual([[], []])
      // Cleaned-up source stays visible solely through an explicit retained snapshot.
      reserved = [{ ...car('websitead', 'SALE_IN_PROGRESS'), websiteOnly: true, reserved: true, sourceStockId: 'car' }]; tick()
      expect((await lists()).map(rows => rows.length)).toEqual([1, 0])
      reserved = []; live = [car()]; tick()
      ;[showroom, soldPage] = await lists()
      expect(showroom[0].metadata.stockId).toBe('car'); expect(isReserved(showroom[0])).toBe(false); expect(soldPage).toEqual([])
    } finally { vi.restoreAllMocks() }
  })

})
