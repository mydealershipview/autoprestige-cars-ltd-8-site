// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { DealershipInfo } from '@/types/dealership'
import { showroomAddress, showroomArea, showroomTown } from '@/utilities/dealershipInfo'

const d = (address: Partial<DealershipInfo['address']>) => ({ address }) as DealershipInfo

// The website admin today: town in line 2, county in "city" (printed "West Yorkshire, West Yorkshire")
describe('showroom address (upgrade spec copy fixes)', () => {
  it('handles the admin as it is today', () => {
    const today = d({ line1: 'Rosse Street', line2: 'Bradford', city: 'West Yorkshire', postcode: 'BD8 9AS' })
    expect(showroomTown(today)).toBe('Bradford')
    expect(showroomArea(today)).toBe('Bradford, West Yorkshire')
    expect(showroomAddress(today)).toBe('Rosse Street, Bradford, West Yorkshire, BD8 9AS')
  })
  it('stays right once the admin is corrected', () => {
    const fixed = d({ line1: 'Rosse Street', city: 'Bradford', postcode: 'BD8 9AS' })
    expect(showroomArea(fixed)).toBe('Bradford, West Yorkshire')
    expect(showroomAddress(fixed)).toBe('Rosse Street, Bradford, West Yorkshire, BD8 9AS')
  })
  it('falls back to Bradford', () => {
    expect(showroomTown(d({}))).toBe('Bradford')
  })
})
