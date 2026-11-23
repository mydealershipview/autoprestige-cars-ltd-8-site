// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { AutoTraderVehicle } from '@/utilities/autotrader'

// Upgrade spec: a sold car's page also offers similar cars in stock. Habib 23/11: the sold archive stays forever and
// the page is otherwise unchanged, so only the new section is added, for sold cars only.
vi.mock('@/lib/analytics', () => ({ trackEvent: () => {} }))
vi.mock('../../src/app/(frontend)/usedcars/[slug]/_components/modals', () => ({
  ReserveModal: () => null, CallUsModal: () => null, FinanceModal: () => null, PartExchangeModal: () => null, EmailModal: () => null,
}))
const stock = vi.hoisted(() => ({ live: [] as unknown[], sold: null as unknown }))
vi.mock('@/lib/services/dmsWebsiteStock', () => ({ getDmsWebsiteVehicles: async () => stock.live }))
vi.mock('@/lib/services/soldCars.service', () => ({ getSoldCarVehicleByStockId: async () => stock.sold }))
vi.mock('@/utilities/mergePayloadData', () => ({
  mergeVehicleWithPayloadData: (v: unknown) => v, fetchPayloadVehicleData: async () => new Map(),
  mergeVehiclesWithPayloadData: async (v: unknown) => v, preferDmsAdvertCopy: (v: unknown) => v,
}))
vi.mock('@/utilities/vehicleOverrides', () => ({ fetchOverridesMap: async () => new Map(), applyOverrideToVehicle: (v: unknown) => v }))
vi.setConfig({ testTimeout: 30000 })

const car = (id: string, make: string, model: string, price: number, state = 'FORECOURT') =>
  ({
    metadata: { stockId: id, lifecycleState: state, lastUpdated: '2026-04-08T10:00:00Z' },
    vehicle: { make, model, yearOfManufacture: 2014, odometerReadingMiles: 30000, registration: 'AB14CDE' },
    adverts: { forecourtPrice: { amountGBP: price }, retailAdverts: {} },
    advertiser: { advertiserId: '1', name: 'Autoprestige', phone: '01274 000000' },
    media: { images: [] },
    features: [],
  }) as unknown as AutoTraderVehicle

const render = async (props: Record<string, unknown>) => {
  const { default: VehicleClient } = await import('@/app/(frontend)/usedcars/[slug]/_components/VehicleClient')
  const { WishlistProvider } = await import('@/contexts/WishlistContext')
  // The site wraps every page in WishlistProvider (src/providers); the car page's Save button needs it
  return renderToStaticMarkup(createElement(WishlistProvider, null, createElement(VehicleClient, { dealershipName: 'Autoprestige', phoneNumber: '01274 000000', whatsappNumber: '447725124729', emailAddress: '', ...props } as never)))
}

describe('sold car page: similar cars', () => {
  it('a sold car keeps its SOLD notice and price, and gains similar cars in stock', async () => {
    const html = await render({ vehicle: car('huracan', 'Lamborghini', 'Huracan', 150000, 'SOLD'), similarVehicles: [car('gallardo', 'Lamborghini', 'Gallardo', 90000)] })
    expect(html).toContain('This vehicle has been sold')
    expect(html).toContain('£150,000')
    expect(html).toContain('Similar cars in stock')
    expect(html).toContain('href="/usedcars/lamborghini-gallardo-2014-gallardo"')
    expect(html).toContain('£90,000')
  })

  it('a car in stock is unchanged: no similar-cars section even if similar cars are passed', async () => {
    const html = await render({ vehicle: car('huracan', 'Lamborghini', 'Huracan', 150000), similarVehicles: [car('gallardo', 'Lamborghini', 'Gallardo', 90000)] })
    expect(html).not.toContain('Similar cars in stock')
    expect(html).not.toContain('This vehicle has been sold')
    expect(html).toContain('£150,000')
  })

  it('a sold car with no similar cars shows no empty section', async () => {
    const html = await render({ vehicle: car('huracan', 'Lamborghini', 'Huracan', 150000, 'SOLD') })
    expect(html).toContain('This vehicle has been sold')
    expect(html).not.toContain('Similar cars in stock')
  })

  it('getVehicleDetails: a sold car with no same-make stock gets the nearest prices; a live car is unchanged', async () => {
    stock.live = [car('bmw', 'BMW', 'M3', 40000), car('audi', 'Audi', 'RS6', 95000), car('ford', 'Ford', 'Fiesta', 8000)]
    stock.sold = car('huracan', 'Lamborghini', 'Huracan', 100000, 'SOLD')
    const { getVehicleDetails } = await import('@/lib/services/vehicleDetails')
    const sold = await getVehicleDetails('huracan')
    expect(sold?.vehicle.metadata.stockId).toBe('huracan')
    expect(sold?.similarProducts[0].metadata.stockId).toBe('audi')
    const live = await getVehicleDetails('bmw')
    expect(live?.similarProducts).toEqual([])
    stock.sold = null
    expect(await getVehicleDetails('unknown')).toBeNull()
  })
})
