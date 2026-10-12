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

describe('Reserved badge requires agreement for real stock', () => {
  it.each([
    ['FORECOURT', 'Available', false],
    ['FORECOURT', 'Reserved', false],
    ['SALE_IN_PROGRESS', 'Available', false],
    ['SALE_IN_PROGRESS', 'Reserved', true],
    ['SALE_IN_PROGRESS', undefined, false],
    ['SOLD', 'Reserved', false],
  ])('%s with advert status %s => Reserved %s', (state, status, expected) => {
    expect(isReserved(car(state as string, status as string | undefined))).toBe(expected)
  })
  it('does not let a derived reserved boolean bypass the two-status rule', () => {
    expect(isReserved(car('FORECOURT', 'Reserved', { reserved: true }))).toBe(false)
    expect(isReserved(car('SALE_IN_PROGRESS', 'Available', { reserved: true }))).toBe(false)
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
