// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createStockAdminSession, verifyStockAdminSession } from '@/utilities/stockAdminSession'
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers() })
describe('stock admin sessions', () => {
  it('rejects the old forgeable cookie and unsigned tokens', async () => {
    vi.stubEnv('PAYLOAD_SECRET', 'a'.repeat(32))
    expect(await verifyStockAdminSession('authenticated')).toBe(false)
    expect(await verifyStockAdminSession(btoa('{"sub":"admin","exp":9999999999}') + '.' + '0'.repeat(64))).toBe(false)
  })
  it('accepts signed sessions, rejects tampering, expiration and secret rotation', async () => {
    vi.stubEnv('PAYLOAD_SECRET', 'a'.repeat(32))
    const token = await createStockAdminSession('admin')
    expect(await verifyStockAdminSession(token)).toBe(true)
    expect(await verifyStockAdminSession('x' + token)).toBe(false)
    vi.stubEnv('PAYLOAD_SECRET', 'b'.repeat(32))
    expect(await verifyStockAdminSession(token)).toBe(false)
    vi.stubEnv('PAYLOAD_SECRET', 'a'.repeat(32))
    vi.useFakeTimers(); vi.advanceTimersByTime(8 * 60 * 60 * 1000)
    expect(await verifyStockAdminSession(token)).toBe(false)
  })
  it('fails closed without a strong signing secret', async () => {
    vi.stubEnv('PAYLOAD_SECRET', '')
    expect(await verifyStockAdminSession('authenticated')).toBe(false)
    await expect(createStockAdminSession('admin')).rejects.toThrow()
  })
})
