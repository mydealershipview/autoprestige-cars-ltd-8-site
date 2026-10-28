// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Signed stock-admin session (28/10/2026): only a real login gets in
vi.mock('@/lib/db/connect', () => ({ default: vi.fn() }))
vi.mock('@/lib/db/models/vehicleOverride.model', () => ({
  default: { findOneAndUpdate: vi.fn(() => ({ lean: () => ({ stockId: 'S1' }) })), deleteOne: vi.fn() },
}))

const original = process.env.PAYLOAD_SECRET
beforeAll(() => { process.env.PAYLOAD_SECRET = 'test-secret-for-stock-admin-sessions-0123456789' })
afterAll(() => { process.env.PAYLOAD_SECRET = original })

const { createStockAdminSession, verifyStockAdminSession } = await import('@/utilities/stockAdminSession')
const { middleware } = await import('@/middleware')
const overrides = await import('@/app/api/vehicle-overrides/[stockId]/route')

const page = (path: string, cookie?: string) =>
  new NextRequest(`https://autoprestigecars.co.uk${path}`, { headers: cookie ? { cookie: `stock_admin_auth=${cookie}` } : {} })

describe('stock-admin session', () => {
  it('accepts a session created at login', async () => {
    expect(await verifyStockAdminSession(await createStockAdminSession('stockadmin'))).toBe(true)
  })

  it('refuses a missing, fixed-value, tampered or expired session', async () => {
    const real = await createStockAdminSession('stockadmin')
    expect(await verifyStockAdminSession(undefined)).toBe(false)
    expect(await verifyStockAdminSession('authenticated')).toBe(false)
    const [body, sig] = real.split('.')
    const forged = btoa(JSON.stringify({ sub: 'x', exp: Math.floor(Date.now() / 1000) + 60 }))
    expect(await verifyStockAdminSession(`${forged}.${sig}`)).toBe(false)
    expect(await verifyStockAdminSession(`${body}.${'0'.repeat(64)}`)).toBe(false)
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 9 * 60 * 60 * 1000)
    expect(await verifyStockAdminSession(real)).toBe(false)
    vi.useRealTimers()
  })

  it('a session signed with another secret is refused', async () => {
    const real = await createStockAdminSession('stockadmin')
    process.env.PAYLOAD_SECRET = 'a-different-secret-0123456789abcdefghij'
    expect(await verifyStockAdminSession(real)).toBe(false)
    process.env.PAYLOAD_SECRET = 'test-secret-for-stock-admin-sessions-0123456789'
  })
})

describe('stock-admin pages and actions', () => {
  it('pages redirect to login without a valid session and open with one', async () => {
    expect((await middleware(page('/stock-admin', 'authenticated'))).headers.get('location')).toContain('/stock-admin/login')
    expect((await middleware(page('/stock-admin'))).headers.get('location')).toContain('/stock-admin/login')
    const ok = await middleware(page('/stock-admin', await createStockAdminSession('stockadmin')))
    expect(ok.headers.get('location')).toBeNull()
    expect((await middleware(page('/stock-admin/login'))).headers.get('location')).toBeNull()
  })

  it('changing or removing a car override needs a valid session', async () => {
    const params = { params: Promise.resolve({ stockId: 'S1' }) }
    const put = (cookie?: string) =>
      overrides.PUT(new NextRequest('https://autoprestigecars.co.uk/api/vehicle-overrides/S1', {
        method: 'PUT', body: JSON.stringify({ listingPrice: 1 }),
        headers: cookie ? { cookie: `stock_admin_auth=${cookie}` } : {},
      }), params)
    expect((await put()).status).toBe(401)
    expect((await put('authenticated')).status).toBe(401)
    expect((await put(await createStockAdminSession('stockadmin'))).status).toBe(200)
    const del = (cookie?: string) =>
      overrides.DELETE(new NextRequest('https://autoprestigecars.co.uk/api/vehicle-overrides/S1', {
        method: 'DELETE', headers: cookie ? { cookie: `stock_admin_auth=${cookie}` } : {},
      }), params)
    expect((await del('authenticated')).status).toBe(401)
    expect((await del(await createStockAdminSession('stockadmin'))).status).toBe(200)
  })
})
