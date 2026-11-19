// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { createHmac } from 'node:crypto'
const mocks = vi.hoisted(() => ({ payload: vi.fn().mockResolvedValue({ find: vi.fn().mockResolvedValue({ docs: [] }) }) }))
vi.mock('@payloadcms/next/utilities', () => ({ getPayloadHMR: mocks.payload }))
vi.mock('@payload-config', () => ({ default: {} }))
import { POST } from '@/app/api/payments/webhook/route'
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks() })
const body = '{"paymentRequestId":"payment-1"}'
function request(signature?: string) { return new NextRequest('https://dealer.example/api/payments/webhook', { method: 'POST', body, headers: signature ? { 'atoa-signature': signature } : {} }) }
describe('payment webhook', () => {
  it('fails closed without configuration', async () => {
    vi.stubEnv('ATOA_WEBHOOK_SECRET', '')
    expect((await POST(request())).status).toBe(503)
    expect(mocks.payload).not.toHaveBeenCalled()
  })
  it('rejects missing, malformed and incorrect signatures before database access', async () => {
    vi.stubEnv('ATOA_WEBHOOK_SECRET', 'secret')
    for (const signature of [undefined, 'invalid', '0'.repeat(64)]) expect((await POST(request(signature))).status).toBe(401)
    expect(mocks.payload).not.toHaveBeenCalled()
  })
  it('processes correctly signed events', async () => {
    vi.stubEnv('ATOA_WEBHOOK_SECRET', 'secret')
    const signature = createHmac('sha256', 'secret').update(body).digest('hex')
    expect((await POST(request(signature))).status).toBe(404)
    expect(mocks.payload).toHaveBeenCalledOnce()
  })
})
