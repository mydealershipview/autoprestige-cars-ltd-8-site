// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { ErrorEvent } from '@sentry/nextjs'
import { prepareEvent } from '@/utilities/monitoring'

// GlitchTip events from this site (30/10/2026): say which dealer, carry no customer details
const event = (e: Partial<ErrorEvent>) => prepareEvent({ type: undefined, ...e } as ErrorEvent)

describe('GlitchTip events', () => {
  it('start with [Auto Prestige] and are tagged dealer=Auto Prestige', () => {
    const e = event({ exception: { values: [{ type: 'TypeError', value: 'x is undefined' }] }, message: 'stock failed' })
    expect(e.exception?.values?.[0].value).toBe('[Auto Prestige] x is undefined')
    expect(e.message).toBe('[Auto Prestige] stock failed')
    expect(e.tags?.dealer).toBe('Auto Prestige')
    expect(event({ message: '[Auto Prestige] once' }).message).toBe('[Auto Prestige] once')
  })
  it('drop the form body on lead routes and redact personal fields everywhere', () => {
    const lead = event({ request: { url: 'https://autoprestigecars.co.uk/api/submit-form', data: { personal: { email: 'a@b.c' } }, query_string: 'x=1' } })
    expect(lead.request?.data).toBeUndefined()
    expect(lead.request?.query_string).toBeUndefined()
    const other = event({
      request: { url: 'https://autoprestigecars.co.uk/api/listing', data: { firstName: 'Jo', stockId: 's1' }, cookies: { a: 'b' }, headers: { cookie: 'c', authorization: 't', 'user-agent': 'ua' } },
      extra: { arguments: [{ email: 'a@b.c', phone_number: '07', make: 'BMW' }] },
      user: { email: 'a@b.c' },
      contexts: { browser: { name: 'Chrome' } },
    })
    expect(other.request?.data).toEqual({ firstName: '[Redacted]', stockId: 's1' })
    expect(other.request?.cookies).toBeUndefined()
    expect(other.request?.headers).toEqual({ 'user-agent': 'ua' })
    expect(other.extra).toEqual({ arguments: [{ email: '[Redacted]', phone_number: '[Redacted]', make: 'BMW' }] })
    expect(other.user).toBeUndefined()
    expect(other.contexts).toEqual({ browser: { name: 'Chrome' } })
  })
  it('name a cancelled link preload, mark it info and group it; a real failed request stays an error', () => {
    const failed = (url: string) => event({
      exception: { values: [{ type: 'TypeError', value: 'Failed to fetch (autoprestigecars.co.uk)' }] },
      breadcrumbs: [{ category: 'fetch', level: 'error', data: { method: 'GET', url } }],
    })
    const preload = failed('https://autoprestigecars.co.uk/used-cars?_rsc=abc')
    expect(preload.exception?.values?.[0].value).toBe('[Auto Prestige] Visitor left page while links were preloading (not a site problem)')
    expect(preload.level).toBe('info')
    expect(preload.fingerprint).toEqual(['preload-cancelled'])
    const real = failed('https://autoprestigecars.co.uk/api/listings')
    expect(real.exception?.values?.[0].value).toBe('[Auto Prestige] Failed to fetch (autoprestigecars.co.uk)')
    expect(real.level).toBeUndefined()
    expect(real.fingerprint).toBeUndefined()
  })
  it('name the start-up notices, mark them info and group them; other warnings unchanged', () => {
    const sqlite = event({ level: 'error', message: '(node:27) ExperimentalWarning: SQLite is an experimental feature and might change at any time' })
    expect(sqlite.message).toBe('[Auto Prestige] Node.js startup notice (not a problem)')
    expect(sqlite.level).toBe('info')
    expect(sqlite.fingerprint).toEqual(['node-sqlite-notice'])
    const key = event({ level: 'warning', logentry: { message: '[dealer-site] DMS_WEBSITE_KEY is not set: using dealer-email stock access.' } })
    expect(key.logentry?.message).toBe('[Auto Prestige] Stock uses the old email method (works; key not set up yet)')
    expect(key.level).toBe('info')
    expect(key.fingerprint).toEqual(['dms-email-access'])
    const other = event({ level: 'warning', message: '[dealer-site] dms_stock_unavailable' })
    expect(other.message).toBe('[Auto Prestige] [dealer-site] dms_stock_unavailable')
    expect(other.level).toBe('warning')
    expect(other.fingerprint).toBeUndefined()
  })
  it('name the Google Maps old-pin notice and mark it info', () => {
    const maps = event({ level: 'warning', message: 'As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead.' })
    expect(maps.message).toBe('[Auto Prestige] Google Maps uses the old map pin type (works; update later)')
    expect(maps.level).toBe('info')
    expect(maps.fingerprint).toEqual(['google-maps-old-marker'])
  })
  it('name Next.js 404 and redirect signals as info, not errors', () => {
    const notFound = event({ exception: { values: [{ type: 'Error', value: 'NEXT_HTTP_ERROR_FALLBACK;404' }] } })
    expect(notFound.exception?.values?.[0].value).toBe('[Auto Prestige] Page not found (old link, not a problem)')
    expect(notFound.level).toBe('info')
    expect(notFound.fingerprint).toEqual(['page-not-found'])
    const redirect = event({ exception: { values: [{ type: 'Error', value: 'NEXT_REDIRECT;replace;/used-cars;308;' }] } })
    expect(redirect.exception?.values?.[0].value).toBe('[Auto Prestige] Page redirect (not a problem)')
    expect(redirect.level).toBe('info')
  })
  it('never send the stock-admin login body (it carries the password)', () => {
    const login = event({ request: { url: 'https://autoprestigecars.co.uk/api/stock-admin-auth', data: { username: 'u', password: 'p' } } })
    expect(login.request?.data).toBeUndefined()
  })
})

