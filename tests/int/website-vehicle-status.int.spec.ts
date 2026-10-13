import { describe, expect, it } from 'vitest'
import { isReserved } from '@/utilities/websiteVehicleStatus'
import type { WebsiteVehicle } from '@/lib/services/dmsWebsiteStock'

const car = (state: string, reservationStatus?: string, extra = {}) => ({
  lifecycleState: state,
  metadata: { stockId: '59ac3a2271294aa59c1d9c592f35433f', lifecycleState: state },
  vehicle: { registration: 'YL19CGP' },
  adverts: { reservationStatus, retailAdverts: {} },
  ...extra,
}) as unknown as WebsiteVehicle

describe('Reserved badge accepts either reservation signal', () => {
  it.each([
    ['FORECOURT', 'Available', false],
    ['FORECOURT', 'Reserved', true],
    ['SALE_IN_PROGRESS', 'Available', true],
    ['SALE_IN_PROGRESS', 'Reserved', true],
    ['SALE_IN_PROGRESS', undefined, true],
    ['SOLD', 'Reserved', true],
  ])('%s with advert status %s => Reserved %s', (state, status, expected) => {
    expect(isReserved(car(state as string, status as string | undefined))).toBe(expected)
  })
  it('accepts the DMS-derived reserved flag as well', () => {
    expect(isReserved(car('FORECOURT', 'Available', { reserved: true }))).toBe(true)
    expect(isReserved(car('SALE_IN_PROGRESS', 'Available', { reserved: true }))).toBe(true)
  })
  it('supports metadata lifecycle and nested reservation status when top-level values are absent', () => {
    expect(isReserved(car('SALE_IN_PROGRESS', undefined, {
      lifecycleState: undefined,
      adverts: { retailAdverts: { reservationStatus: ' reserved ' } },
    }))).toBe(true)
  })
  it('preserves an explicitly selected website-only Reserved snapshot', () => {
    expect(isReserved(car('SOLD', 'Available', { websiteOnly: true, reserved: true }))).toBe(true)
  })
})
