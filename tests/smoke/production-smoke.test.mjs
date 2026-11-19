import test from 'node:test'
import assert from 'node:assert/strict'
const base = process.env.REVIEW_BASE_URL
if (base && !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Smoke tests require an isolated local site')
const smoke = (name, run) => test(name, { skip: !base }, run)
smoke('unknown pages and unknown vehicles return HTTP 404', async () => {
  for (const path of ['/review-missing-page-404', '/usedcars/bmw-missing-2020-missing']) {
    const response = await fetch(base + path)
    assert.equal(response.status, 404, path)
    assert.match(await response.text(), /Page Not Found|not found/i)
  }
})
smoke('content pages publish their own canonical and real dealer contacts', async () => {
  for (const path of ['/contact', '/complaints', '/privacy-policy']) {
    const response = await fetch(base + path)
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.match(html, new RegExp(`rel="canonical" href="https://autoprestigecars.co.uk${path}"`))
    assert.ok(!html.includes('01157844104'))
  }
})
smoke('robots exposes real sitemaps and hides admin routes', async () => {
  const response = await fetch(base + '/robots.txt')
  assert.equal(response.status, 200)
  const text = await response.text()
  assert.match(text, /Disallow: \/stock-admin/)
  assert.match(text, /Sitemap: https:\/\/autoprestigecars.co.uk\/vehicles-sitemap.xml/)
  assert.ok(!text.includes('localhost'))
})
smoke('forged cookies cannot mutate inventory or open stock admin', async () => {
  const headers = { cookie: 'stock_admin_auth=authenticated', 'content-type': 'application/json' }
  const admin = await fetch(base + '/stock-admin', { headers, redirect: 'manual' })
  assert.equal(admin.status, 307)
  for (const method of ['PUT', 'DELETE']) {
    const response = await fetch(base + '/api/vehicle-overrides/smoke-never-written', { method, headers, ...(method === 'PUT' ? { body: '{"listingPrice":1}' } : {}) })
    assert.equal(response.status, 401)
  }
  const plate = await fetch(base + '/api/reg-plates', { method: 'POST', headers, body: '{}' })
  assert.equal(plate.status, 401)
})
smoke('unsigned payment events and trapped leads fail closed', async () => {
  const payment = await fetch(base + '/api/payments/webhook', { method: 'POST', body: '{"paymentRequestId":"smoke-never-paid","status":"COMPLETED"}' })
  assert.ok([401, 503].includes(payment.status))
  for (const path of ['/api/submit-form', '/api/submit-reservation']) {
    const response = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"website":"spam"}' })
    assert.equal(response.status, 400)
  }
})
