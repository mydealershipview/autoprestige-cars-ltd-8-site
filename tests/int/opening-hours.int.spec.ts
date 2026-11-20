// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  OPENING_HOURS_LINES,
  formatTime,
  openingHoursSentence,
  openingHoursSpecification,
} from '@/data/openingHours'
import { REG_PLATES_OPENING_TIMES } from '@/data/regPlates'

// One set of hours everywhere (Habib, 20/11/2026): Mon–Fri 10–6, Sat 10–4, Sun closed
describe('opening hours', () => {
  it('formats times', () => {
    expect(formatTime('10:00')).toBe('10am')
    expect(formatTime('18:00')).toBe('6pm')
    expect(formatTime('12:00')).toBe('12pm')
    expect(formatTime('16:30')).toBe('4:30pm')
  })
  it('gives the footer / contact lines', () => {
    expect(OPENING_HOURS_LINES).toEqual(['Mon – Fri: 10am – 6pm', 'Saturday: 10am – 4pm', 'Sunday: Closed'])
  })
  it('gives the FAQ sentence', () => {
    expect(openingHoursSentence()).toBe('Monday to Friday 10am–6pm, Saturday 10am–4pm, closed on Sunday')
  })
  it('gives Google structured data with open days only', () => {
    expect(openingHoursSpecification()).toEqual([
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '16:00' },
    ])
  })
  it('Reg Plates pages use the same hours', () => {
    expect(REG_PLATES_OPENING_TIMES).toEqual(['Viewing by prior arrangement only', ...OPENING_HOURS_LINES])
  })
})
