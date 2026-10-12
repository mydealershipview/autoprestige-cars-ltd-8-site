import { describe, expect, it } from 'vitest'
import { isLiveListing, isReserved } from '@/utilities/websiteVehicleStatus'
import type { WebsiteVehicle } from '@/lib/services/dmsWebsiteStock'

const suppliedCar = {
  stockId: '59ac3a2271294aa59c1d9c592f35433f', lifecycleState: 'FORECOURT',
  metadata: { stockId: '59ac3a2271294aa59c1d9c592f35433f', lifecycleState: 'FORECOURT' },
  vehicle: { registration: 'YL19CGP', make: 'Volkswagen', model: 'up!' },
  adverts: { reservationStatus: 'Reserved', retailAdverts: { advertiserAdvert: { status: 'PUBLISHED' } } },
} as unknown as WebsiteVehicle

describe('DMS lifecycle controls the website Reserved badge', () => {
  it('does not mark the supplied FORECOURT car Reserved because of an outdated raw advert flag', () => {
    expect(isReserved(suppliedCar)).toBe(false)
    expect(isLiveListing(suppliedCar)).toBe(true)
  })
  it('ignores the derived reserved boolean and legacy nested flag on real FORECOURT stock', () => {
    expect(isReserved({ ...suppliedCar, reserved: true })).toBe(false)
    expect(isReserved({ ...suppliedCar, adverts: { ...suppliedCar.adverts,
      retailAdverts: { ...suppliedCar.adverts.retailAdverts, reservationStatus: 'Reserved' } } })).toBe(false)
  })
  it('still marks genuine DMS SALE_IN_PROGRESS stock Reserved', () => {
    expect(isReserved({ ...suppliedCar, lifecycleState: 'SALE_IN_PROGRESS' })).toBe(true)
    expect(isReserved({ ...suppliedCar, lifecycleState: undefined,
      metadata: { ...suppliedCar.metadata, lifecycleState: 'SALE_IN_PROGRESS' } })).toBe(true)
  })
  it('preserves explicitly selected website-only Reserved adverts even after sale', () => {
    const retained = { ...suppliedCar, websiteOnly: true, reserved: true, lifecycleState: 'SOLD' }
    expect(isReserved(retained)).toBe(true)
    expect(isLiveListing(retained)).toBe(true)
    expect(isReserved({ ...retained, websiteOnly: false })).toBe(false)
  })
})
