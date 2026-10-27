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
  it('allows legitimate submissions and throttles excess submissions', async () => {
    expect(await guardLead(req(), { website: '' })).toBeNull()
    mocks.update.mockResolvedValue({ count: 11 })
    const response = await guardLead(req(), {})
    expect(response?.status).toBe(429)
    expect(response?.headers.get('Retry-After')).toBe('600')
  })
})
