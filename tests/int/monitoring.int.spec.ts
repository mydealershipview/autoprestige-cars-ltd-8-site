// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { ErrorEvent } from '@sentry/nextjs'
import { prepareEvent } from '@/utilities/monitoring'

// GlitchTip events from this site (30/10/2026): say which dealer, carry no customer details
const event = (e: Partial<ErrorEvent>) => prepareEvent({ type: undefined, ...e } as ErrorEvent) as ErrorEvent
const raw = (e: Partial<ErrorEvent>, browser = false) => prepareEvent({ type: undefined, ...e } as ErrorEvent, { browser })

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
    // A cancelled link preload is not sent at all since 24/11/2026
    expect(raw({
      exception: { values: [{ type: 'TypeError', value: 'Failed to fetch (autoprestigecars.co.uk)' }] },
      breadcrumbs: [{ category: 'fetch', level: 'error', data: { method: 'GET', url: 'https://autoprestigecars.co.uk/used-cars?_rsc=abc' } }],
    }, true)).toBeNull()
    const real = failed('https://autoprestigecars.co.uk/api/listings')
    expect(real.exception?.values?.[0].value).toBe('[Auto Prestige] Failed to fetch (autoprestigecars.co.uk)')
    expect(real.level).toBeUndefined()
    expect(real.fingerprint).toBeUndefined()
  })
  it('name the start-up notices, mark them info and group them; other warnings unchanged', () => {
    expect(raw({ level: 'error', message: '(node:27) ExperimentalWarning: SQLite is an experimental feature and might change at any time' })).toBeNull()
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
    expect(raw({ level: 'warning', message: 'As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead.' }, true)).toBeNull()
  })
  it('name Next.js 404 and redirect signals as info, not errors', () => {
    expect(raw({ exception: { values: [{ type: 'Error', value: 'NEXT_HTTP_ERROR_FALLBACK;404' }] } })).toBeNull()
    expect(raw({ exception: { values: [{ type: 'Error', value: 'NEXT_REDIRECT;replace;/used-cars;308;' }] } })).toBeNull()
  })
  it('never send the stock-admin login body (it carries the password)', () => {
    const login = event({ request: { url: 'https://autoprestigecars.co.uk/api/stock-admin-auth', data: { username: 'u', password: 'p' } } })
    expect(login.request?.data).toBeUndefined()
  })
  it('name a ChunkLoadError after a deploy and mark it info', () => {
    expect(raw({ exception: { values: [{ type: 'ChunkLoadError', value: 'Loading chunk 2619 failed.' }] } }, true)).toBeNull()
  })
  it('name a bot\'s fake form request as info, one issue; a real missing server action stays an error', () => {
    for (const value of ['The Server Reference ID did not match the expected format. Received "x".', 'Invalid Server Actions request.']) {
      expect(raw({ exception: { values: [{ type: 'Error', value }] } })).toBeNull()
    }
    const real = event({ exception: { values: [{ type: 'Error', value: 'Failed to find Server Action "7f7ff1ab4916b7857cc2003b466a976a60bd37c451".' }] } })
    expect(real.exception?.values?.[0].value).toBe('[Auto Prestige] Failed to find Server Action "7f7ff1ab4916b7857cc2003b466a976a60bd37c451".')
    expect(real.level).toBeUndefined()
    expect(real.fingerprint).toBeUndefined()
  })
  it('mark errors from search-engine crawlers as info, labelled; customer errors unchanged', () => {
    const bot = event({ request: { url: 'https://autoprestigecars.co.uk/used-cars/x', headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1) Chrome/141 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } }, exception: { values: [{ type: 'SyntaxError', value: "Failed to execute 'json' on 'Response'" }] } })
    expect(bot.level).toBe('info')
    expect(bot.exception?.values?.[0].value).toBe("[Auto Prestige] (search-engine crawler, not a customer) Failed to execute 'json' on 'Response'")
    const person = event({ request: { url: 'https://autoprestigecars.co.uk/used-cars/x', headers: { 'User-Agent': 'Mozilla/5.0 (iPhone) Safari/605.1.15' } }, exception: { values: [{ type: 'TypeError', value: 'x is undefined' }] } })
    expect(person.level).toBeUndefined()
    expect(person.exception?.values?.[0].value).toBe('[Auto Prestige] x is undefined')
  })
  it('mark errors from an in-app browser script (Instagram) as info, labelled', () => {
    const insta = event({ exception: { values: [{ type: 'SyntaxError', value: "'.border-white/25' is not a valid selector.", stacktrace: { frames: [{ filename: '[native code]', function: 'querySelector' }, { filename: 'app:///', function: 'checkButtonSignals' }] } }] } })
    expect(insta.level).toBe('info')
    expect(insta.exception?.values?.[0].value).toBe("[Auto Prestige] (in-app browser script, not our code) '.border-white/25' is not a valid selector.")
    const ours = event({ exception: { values: [{ type: 'TypeError', value: 'x is undefined', stacktrace: { frames: [{ filename: 'https://autoprestigecars.co.uk/_next/static/chunks/app.js' }] } }] } })
    expect(ours.level).toBeUndefined()
  })
  it('24/11/2026: browser errors from a named search crawler are not sent; the same error from a person, or on the server, still is', () => {
    const googlebot = 'Mozilla/5.0 (Linux; Android 6.0.1) Chrome/141 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    const err = (ua: string) => ({ request: { url: 'https://autoprestigecars.co.uk/', headers: { 'User-Agent': ua } }, exception: { values: [{ type: 'SyntaxError', value: 'Unexpected end of JSON input' }] } })
    expect(raw(err(googlebot), true)).toBeNull()
    expect(raw(err('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'), true)).toBeNull()
    // A real phone whose name contains "bot" (Cubot) is still sent (labelled as before by the loose check)
    expect(raw(err('Mozilla/5.0 (Linux; Android 13; CUBOT KINGKONG 9) Chrome/131 Mobile Safari/537.36'), true)).not.toBeNull()
    expect(raw(err('Mozilla/5.0 (iPhone) Safari/605.1.15'), true)).not.toBeNull()
    // A server report a crawler caused is still sent, labelled as before
    expect(raw(err(googlebot))?.level).toBe('info')
  })
  it('24/11/2026: browser errors with no file of ours in the stack are not sent; errors in our files still are', () => {
    const extension = { exception: { values: [{ type: 'SyntaxError', value: "'.border-white/25' is not a valid selector.", stacktrace: { frames: [{ filename: '[native code]', function: 'querySelector' }, { filename: 'app://availability_signals_extractor', function: 'checkButtonSignals' }] } }] } }
    expect(raw(extension, true)).toBeNull()
    const ourChunk = { exception: { values: [{ type: 'Error', value: 'Minified React error #418', stacktrace: { frames: [{ filename: 'app:///_next/static/chunks/4bd1b696.js' }] } }] } }
    expect(raw(ourChunk, true)).not.toBeNull()
    const mixed = { exception: { values: [{ type: 'TypeError', value: 'x is undefined', stacktrace: { frames: [{ filename: 'app://extension' }, { filename: 'app:///_next/static/chunks/page.js' }] } }] } }
    expect(raw(mixed, true)).not.toBeNull()
    const noFrames = { exception: { values: [{ type: 'TypeError', value: 'x is undefined' }] } }
    expect(raw(noFrames, true)).not.toBeNull()
    // The same extension error on the server side is not touched by this rule
    expect(raw(extension)).not.toBeNull()
  })
  it('24/11/2026: the old-email-method notice and real errors are still sent', () => {
    expect(raw({ level: 'warning', logentry: { message: '[dealer-site] DMS_WEBSITE_KEY is not set' } })).not.toBeNull()
    expect(raw({ level: 'warning', message: '[dealer-site] dms_stock_unavailable' })).not.toBeNull()
  })
})
