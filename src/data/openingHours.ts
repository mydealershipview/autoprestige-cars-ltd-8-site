/**
 * Autoprestige opening hours: the one place they are set (Habib, 20/11/2026). The footer, contact
 * page, About and Reg Plates pages, FAQ and Google structured data all read this list, so they can't
 * disagree again (before this, the site showed five different sets). Hours in the website admin are
 * no longer shown. Change them here until they come from the DMS (upgrade spec).
 */
export type OpeningHoursRow = {
  label: string
  days: string[]
  /** 24-hour "HH:MM"; null when closed */
  opens: string | null
  closes: string | null
}

export const OPENING_HOURS: OpeningHoursRow[] = [
  { label: 'Mon – Fri', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '18:00' },
  { label: 'Saturday', days: ['Saturday'], opens: '10:00', closes: '16:00' },
  { label: 'Sunday', days: ['Sunday'], opens: null, closes: null },
]

/** "10:00" -> "10am", "16:30" -> "4:30pm" */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  return m ? `${hour}:${String(m).padStart(2, '0')}${suffix}` : `${hour}${suffix}`
}

/** "10am – 6pm" or "Closed" */
export function hoursText(row: OpeningHoursRow): string {
  return row.opens && row.closes ? `${formatTime(row.opens)} – ${formatTime(row.closes)}` : 'Closed'
}

/** One line per row: "Mon – Fri: 10am – 6pm" */
export const OPENING_HOURS_LINES = OPENING_HOURS.map((row) => `${row.label}: ${hoursText(row)}`)

/** For sentences: "Monday to Friday 10am–6pm, Saturday 10am–4pm, closed on Sunday" */
export function openingHoursSentence(): string {
  const open = OPENING_HOURS.filter((r) => r.opens && r.closes).map((r) => {
    const days = r.days.length > 1 ? `${r.days[0]} to ${r.days[r.days.length - 1]}` : r.days[0]
    return `${days} ${formatTime(r.opens!)}–${formatTime(r.closes!)}`
  })
  const closed = OPENING_HOURS.filter((r) => !r.opens).flatMap((r) => r.days)
  return closed.length ? `${open.join(', ')}, closed on ${closed.join(' and ')}` : open.join(', ')
}

/** schema.org OpeningHoursSpecification: open days only (a closed day is simply left out) */
export function openingHoursSpecification() {
  return OPENING_HOURS.filter((r) => r.opens && r.closes).map((r) => ({
    '@type': 'OpeningHoursSpecification' as const,
    dayOfWeek: r.days.length > 1 ? r.days : r.days[0],
    opens: r.opens!,
    closes: r.closes!,
  }))
}
