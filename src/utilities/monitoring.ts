import type { ErrorEvent } from '@sentry/nextjs'

/**
 * GlitchTip (project dealer-auto-prestige), 30/10/2026. Every error is reported, server and browser, and each
 * one starts with "[Auto Prestige]" and carries the tag dealer=Auto Prestige so an alert shows which site it is from.
 * Customer details never leave the site: form bodies on lead routes are dropped and personal keys
 * are redacted everywhere (same rules as the DMS).
 *
 * 24/11/2026 (Habib: stop the reports that don't matter coming through): reports already named
 * "not a problem" here since 30/10 are no longer sent at all (see notSentReason). Every other
 * report, and every server error even when a crawler caused it, is sent exactly as before.
 */
export const DEALER = 'Auto Prestige'
const PREFIX = `[${DEALER}] `

// Not plain "name": contexts use it for the browser, OS and runtime, which help with debugging
const SENSITIVE_KEYS = ['email', 'phone', 'mobile', 'firstname', 'lastname', 'fullname', 'customername', 'address', 'postcode',
  'registration', 'password', 'secret', 'token', 'signature', 'dob', 'dateofbirth', 'bank', 'iban', 'sortcode']
// Form bodies never sent: lead forms, payments, and the stock-admin login (it carries the password)
const LEAD_PATH = /\/api\/(submit-form|submit-reservation|payments|stock-admin-auth)(\/|$|\?)/

function redact(value: unknown, depth = 0): unknown {
  if (!value || typeof value !== 'object' || depth > 8) return value
  const copy: Record<string, unknown> = Array.isArray(value)
    ? ([...(value as unknown[])] as unknown as Record<string, unknown>)
    : { ...(value as Record<string, unknown>) }
  for (const key of Object.keys(copy)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().replace(/[_-]/g, '').includes(s))) copy[key] = '[Redacted]'
    else if (typeof copy[key] === 'object') copy[key] = redact(copy[key], depth + 1)
  }
  return copy
}

const prefix = (text?: string) => (text && !text.startsWith(PREFIX) ? PREFIX + text : text)

const FETCH_FAILED = /^(Failed to fetch|Load failed|NetworkError when attempting to fetch)/i
export const PRELOAD_CANCELLED = 'Visitor left page while links were preloading (not a site problem)'

/**
 * A visitor leaving a page cancels Next.js's link preloads (?_rsc= requests) and the browser reports
 * "Failed to fetch". Not a site problem, but kept visible (Osama, 30/10/2026): renamed so it says
 * what it is, marked info, and grouped into one issue so it counts up instead of alerting each time.
 * Any other failed request is reported as an error as before.
 */
function isCancelledPreload(event: ErrorEvent) {
  const value = event.exception?.values?.[0]?.value || ''
  if (!FETCH_FAILED.test(value)) return false
  const lastFailed = [...(event.breadcrumbs || [])]
    .reverse()
    .find((b) => (b.category === 'fetch' || b.category === 'xhr') && (b.level === 'error' || !b.data?.status_code))
  return typeof lastFailed?.data?.url === 'string' && /[?&]_rsc=/.test(lastFailed.data.url)
}

/**
 * Notices logged once each time the site starts. Not problems, but kept visible (Osama, 30/10/2026):
 * named for what they are, marked info, one grouped issue each, instead of looking like new errors.
 */
// notSent: true = not sent at all since 24/11/2026 (Habib); the rest are still sent, renamed.
const KNOWN_NOTICES = [
  { match: /ExperimentalWarning: SQLite is an experimental feature/, id: 'node-sqlite-notice', title: 'Node.js startup notice (not a problem)', notSent: true },
  // Still sent: it's a set-up to-do (give this site a DMS_WEBSITE_KEY), not noise.
  { match: /DMS_WEBSITE_KEY is not set/, id: 'dms-email-access', title: 'Stock uses the old email method (works; key not set up yet)' },
  // Next.js's own signals for a 404 page or a redirect, logged by a page's catch block (30/10/2026):
  // a visitor opened an old link, e.g. to a sold car, and was shown "Page not found". Not a fault.
  { match: /NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND/, id: 'page-not-found', title: 'Page not found (old link, not a problem)', notSent: true },
  { match: /NEXT_REDIRECT/, id: 'page-redirect', title: 'Page redirect (not a problem)', notSent: true },
  // Google's notice for every page with a map (30/10/2026): the map works; the pin type needs updating later
  { match: /google\.maps\.Marker is deprecated/, id: 'google-maps-old-marker', title: 'Google Maps uses the old map pin type (works; update later)', notSent: true },
  // A visitor (or a search crawler) with a page from before a deploy asks for a script file the new
  // version replaced. Refreshing fixes it (31/10/2026: seen right after deploys).
  { match: /ChunkLoadError|Loading chunk [\w-]+ failed|Failed to load chunk/, id: 'chunk-load-after-deploy', title: 'Visitor had the previous version open (refresh fixes it)', notSent: true },
  // A scanner posting a made-up form action to the home page (20/11/2026: same fake ID "x"/"y",
  // same form boundary and user agent on all six dealer sites). Next.js rejects it before any code
  // runs, so nothing reaches a customer. A real browser never sends a malformed ID. Only these exact
  // two rejections match; "Failed to find Server Action" (a real but old ID) is left as it is.
  { match: /Server Reference ID did not match the expected format|Invalid Server Actions request/, id: 'bot-fake-form-request', title: 'Bot sent a fake form request (blocked, not a customer)', notSent: true },
]

function knownNotice(event: ErrorEvent) {
  const text = [event.message, event.logentry?.message, ...(event.exception?.values || []).map((v) => v.value)]
    .filter(Boolean)
    .join(' ')
  return KNOWN_NOTICES.find((n) => n.match.test(text))
}

function renameKnownNotice(event: ErrorEvent) {
  const notice = knownNotice(event)
  if (!notice) return
  event.level = 'info'
  event.fingerprint = [notice.id]
  if (typeof event.message === 'string') event.message = notice.title
  if (event.logentry?.message) event.logentry = { ...event.logentry, message: notice.title }
  for (const value of event.exception?.values || []) value.value = notice.title
}

const CRAWLER = /bot|crawler|spider|crawling|Googlebot|bingbot|AhrefsBot|SemrushBot|facebookexternalhit/i

/** Errors seen only by a search-engine crawler (e.g. Googlebot cutting a request short): kept, marked info. */
function markCrawler(event: ErrorEvent) {
  const agent = event.request?.headers?.['User-Agent'] || event.request?.headers?.['user-agent'] || ''
  if (!CRAWLER.test(agent)) return
  event.level = 'info'
  event.tags = { ...event.tags, crawler: 'yes' }
  const label = '(search-engine crawler, not a customer) '
  if (typeof event.message === 'string') event.message = label + event.message
  for (const value of event.exception?.values || []) value.value = label + (value.value || value.type || 'Error')
}

/**
 * Errors thrown inside a script the visitor's app injects (Instagram / Facebook in-app browser:
 * stack frames at app:///, e.g. checkButtonSignals), not our code (seen 30/10/2026). Kept, marked info.
 */
function markInAppScript(event: ErrorEvent) {
  const frames = (event.exception?.values || []).flatMap((v) => v.stacktrace?.frames || [])
  if (!frames.some((f) => (f.filename || f.abs_path || '').startsWith('app:///'))) return
  event.level = 'info'
  event.tags = { ...event.tags, in_app_browser_script: 'yes' }
  for (const value of event.exception?.values || []) value.value = `(in-app browser script, not our code) ${value.value || value.type || 'Error'}`
}

/**
 * Named search-engine and SEO crawlers only (not the loose CRAWLER above: "bot" alone also matches
 * real phones such as Cubot). 24/11/2026: every browser error left on the dealer sites' pages from a
 * crawler was one of these, e.g. Buy Brand's 310 reports were Googlebot 301 and Bingbot 9.
 */
const SEARCH_CRAWLER =
  /Googlebot|Storebot-Google|AdsBot-Google|Google-InspectionTool|Mediapartners-Google|bingbot|BingPreview|YandexBot|Baiduspider|DuckDuckBot|Applebot|PetalBot|AhrefsBot|SemrushBot|MJ12bot|DotBot|GPTBot|ClaudeBot|Bytespider|facebookexternalhit/i

/**
 * An error whose stack has no file of ours (ours are app:///_next/...), only a script something
 * else put in the page: an in-app browser's or extension's own script (e.g. checkButtonSignals at
 * app://availability_signals_extractor, '.border-white/25' is not a valid selector) or native code.
 * An error with any frame of ours, or with no frames, is not matched.
 */
function onlyOtherScripts(event: ErrorEvent) {
  const files = (event.exception?.values || []).flatMap((v) => v.stacktrace?.frames || []).map((f) => f.filename || f.abs_path || '')
  return files.length > 0 && !files.some((f) => f.startsWith('app:///_next/')) && files.some((f) => /^app:\/\//.test(f))
}

/**
 * Why a report is not sent at all (Habib 24/11/2026), or null to send it. Browser-only rules never
 * touch server reports: a server error is sent even when a crawler caused it.
 */
export function notSentReason(event: ErrorEvent, side: { browser?: boolean } = {}): string | null {
  const agent = event.request?.headers?.['User-Agent'] || event.request?.headers?.['user-agent'] || ''
  if (side.browser && SEARCH_CRAWLER.test(agent)) return 'search-crawler'
  if (side.browser && onlyOtherScripts(event)) return 'not-our-script'
  if (isCancelledPreload(event)) return 'preload-cancelled'
  const notice = knownNotice(event)
  return notice?.notSent ? notice.id : null
}

export function prepareEvent(event: ErrorEvent, side: { browser?: boolean } = {}): ErrorEvent | null {
  if (notSentReason(event, side)) return null
  markCrawler(event)
  markInAppScript(event)
  if (isCancelledPreload(event)) {
    event.level = 'info'
    event.fingerprint = ['preload-cancelled']
    event.exception!.values![0].value = PRELOAD_CANCELLED
  }
  renameKnownNotice(event)
  event.tags = { ...event.tags, dealer: DEALER }
  // The dealer name first, so the GlitchTip title and the Slack alert say which site
  if (typeof event.message === 'string') event.message = prefix(event.message)
  if (event.logentry?.message) event.logentry = { ...event.logentry, message: prefix(event.logentry.message) }
  for (const value of event.exception?.values || []) value.value = prefix(value.value || value.type || 'Error')

  if (event.request) {
    if (LEAD_PATH.test(event.request.url || '')) {
      delete event.request.data
      delete event.request.query_string
    }
    delete event.request.cookies
    if (event.request.data) event.request.data = redact(event.request.data) as typeof event.request.data
    for (const key of Object.keys(event.request.headers || {}))
      if (/^(cookie|authorization)$|secret|signature|token/i.test(key)) delete event.request.headers![key]
  }
  delete event.user
  if (event.extra) event.extra = redact(event.extra) as typeof event.extra
  if (event.contexts) event.contexts = redact(event.contexts) as typeof event.contexts
  return event
}
