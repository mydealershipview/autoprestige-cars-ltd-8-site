// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { AutoTraderVehicle } from '@/utilities/autotrader'

vi.mock('@/lib/analytics', () => ({ trackEvent: () => {}, trackLead: () => {} }))
vi.mock('../../src/app/(frontend)/usedcars/[slug]/_components/modals', () => ({
  ReserveModal: () => null, CallUsModal: () => null, FinanceModal: () => null, PartExchangeModal: () => null, EmailModal: () => null,
}))

const car = (state: string) =>
  ({
    metadata: { stockId: 'stock-1', lifecycleState: state, lastUpdated: '2026-04-08T10:00:00Z' },
    vehicle: { make: 'BMW', model: 'X5', yearOfManufacture: 2020, odometerReadingMiles: 30000, registration: 'AB20CDE' },
    adverts: { forecourtPrice: { amountGBP: 30000 }, retailAdverts: {} },
    advertiser: { advertiserId: '1', name: 'Autoprestige', phone: '01274 000000' },
    media: { images: [] },
    features: [],
  }) as unknown as AutoTraderVehicle

const render = async (vehicle: AutoTraderVehicle) => {
  const { default: VehicleClient } = await import('@/app/(frontend)/usedcars/[slug]/_components/VehicleClient')
  const { WishlistProvider } = await import('@/contexts/WishlistContext')
  return renderToStaticMarkup(createElement(WishlistProvider, null, createElement(VehicleClient, {
    vehicle, dealershipName: 'Autoprestige', phoneNumber: '', whatsappNumber: '', emailAddress: '',
  })))
}

afterEach(() => { vi.unstubAllEnvs() })

describe('car page: save and price-drop alert', () => {
  it('alerts switch off (default): a car in stock offers Save but no price-drop alert', async () => {
    const html = await render(car('FORECOURT'))
    expect(html).toContain('>Save<')
    expect(html).not.toContain('Price Drop Alert')
  })
  it('alerts switch on: a car in stock offers Save and the price-drop alert', async () => {
    vi.stubEnv('NEXT_PUBLIC_STOCK_ALERTS_ENABLED', 'true')
    const html = await render(car('FORECOURT'))
    expect(html).toContain('Price Drop Alert')
    expect(html).toContain('>Save<')
  })
  it('a sold car offers neither, even with the switch on', async () => {
    vi.stubEnv('NEXT_PUBLIC_STOCK_ALERTS_ENABLED', 'true')
    const html = await render(car('SOLD'))
    expect(html).toContain('This vehicle has been sold')
    expect(html).not.toContain('Price Drop Alert')
    expect(html).not.toContain('>Save<')
  })
})
