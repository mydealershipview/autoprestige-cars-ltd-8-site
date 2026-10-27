const lastReported = new Map<string, number>()
/** Send fixed event codes only: no customer data, feed URLs, keys or provider responses. */
export async function reportOperationalError(code: string) {
  console.error(`[dealer-site] ${code}`)
  const dsn = process.env.GLITCHTIP_DSN
  if (!dsn || (lastReported.get(code) || 0) > Date.now() - 60_000) return
  lastReported.set(code, Date.now())
  try {
    const url = new URL(dsn)
    const project = url.pathname.split('/').filter(Boolean).pop()
    if (!project || url.protocol !== 'https:') throw new Error('Invalid monitoring configuration')
    const key = url.username
    const prefix = url.pathname.slice(0, url.pathname.lastIndexOf('/'))
    const endpoint = `${url.origin}${prefix}/api/${project}/store/`
    const response = await fetch(endpoint, { method: 'POST', signal: AbortSignal.timeout(3000), headers: {
      'Content-Type': 'application/json', 'X-Sentry-Auth': `Sentry sentry_version=7,sentry_client=dealer-site/1.0,sentry_key=${key}`,
    }, body: JSON.stringify({ event_id: crypto.randomUUID().replaceAll('-', ''), timestamp: Date.now() / 1000,
      platform: 'javascript', level: 'error', logger: 'dealer-site', message: code }) })
    if (!response.ok) console.error('[dealer-site] monitoring_delivery_failed')
  } catch { console.error('[dealer-site] monitoring_delivery_failed') }
}
