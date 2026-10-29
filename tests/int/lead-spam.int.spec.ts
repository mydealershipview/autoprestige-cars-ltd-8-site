// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({ update: vi.fn(), connect: vi.fn() }))
vi.mock('@/lib/db/connect', () => ({ default: mocks.connect }))
vi.mock('mongoose', () => ({ default: { Schema: class { index() {} }, models: { WebsiteLeadLimit: { findOneAndUpdate: mocks.update } } } }))
import { guardLead } from '@/utilities/leadSpamGuard'
beforeEach(() => { vi.clearAllMocks(); mocks.update.mockResolvedValue({ count: 1 }) })
const req = (origin = 'https://dealer.example') => new NextRequest('https://dealer.example/api/submit-form', { headers: { origin, 'x-forwarded-for': '192.0.2.1' } })
describe('lead abuse prevention', () => {
  it('rejects filled traps and cross-origin posts without writing or sending', async () => {
    expect((await guardLead(req(), { website: 'spam' }))?.status).toBe(400)
    expect((await guardLead(req('https://spam.example'), {}))?.status).toBe(403)
    expect(mocks.connect).not.toHaveBeenCalled()
  })
  it('accepts the live site behind the proxy, where request.url is the internal address', async () => {
    // Self-hosted: Next sees localhost:3000; the browser sends the real domain (403 before 28/10/2026)
    const live = (origin: string, headers: Record<string, string> = {}) =>
      new NextRequest('http://localhost:3000/api/submit-form', {
        headers: { origin, host: 'localhost:3000', 'x-forwarded-for': '192.0.2.1', ...headers },
      })
    expect(await guardLead(live('https://autoprestigecars.co.uk', { 'x-forwarded-host': 'autoprestigecars.co.uk' }), {})).toBeNull()
    expect(await guardLead(live('https://autoprestigecars.co.uk'), {})).toBeNull()
    expect(await guardLead(live('https://www.autoprestigecars.co.uk'), {})).toBeNull()
    expect(await guardLead(live('https://staging.example', { 'x-forwarded-host': 'staging.example' }), {})).toBeNull()
    expect((await guardLead(live('https://spam.example', { 'x-forwarded-host': 'autoprestigecars.co.uk' }), {}))?.status).toBe(403)
    expect((await guardLead(live('https://autoprestigecars.co.uk.spam.example'), {}))?.status).toBe(403)
    expect((await guardLead(live('null'), {}))?.status).toBe(403)
  })
  it('allows legitimate submissions and throttles excess submissions', async () => {
    expect(await guardLead(req(), { website: '' })).toBeNull()
    mocks.update.mockResolvedValue({ count: 11 })
    const response = await guardLead(req(), {})
    expect(response?.status).toBe(429)
    expect(response?.headers.get('Retry-After')).toBe('600')
  })
  it('never loses a real lead to the limit itself (29/10/2026)', async () => {
    // No visitor IP: no shared "unknown" bucket that could block everyone
    const noIp = new NextRequest('https://dealer.example/api/submit-form', { headers: { origin: 'https://dealer.example' } })
    expect(await guardLead(noIp, {})).toBeNull()
    expect(mocks.update).not.toHaveBeenCalled()
    // Limit store down: the lead goes through and the failure is logged
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.connect.mockRejectedValueOnce(new Error('db down'))
    expect(await guardLead(req(), {})).toBeNull()
    mocks.update.mockRejectedValueOnce(new Error('write failed'))
    expect(await guardLead(req(), {})).toBeNull()
    expect(log).toHaveBeenCalledTimes(2)
    log.mockRestore()
  })
})
