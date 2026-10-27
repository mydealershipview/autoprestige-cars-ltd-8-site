// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { getLeadConfig } from '@/utilities/dmsLead'
afterEach(() => vi.unstubAllEnvs())
it('requires the server dealer identity, secret and webhook', () => {
  vi.stubEnv('DEALER_ID', ''); vi.stubEnv('EXTERNAL_NOTIFICATIONS_WEBHOOK_SECRET', ''); vi.stubEnv('FORM_SUBMIT_WEBHOOK_URL', '')
  expect(() => getLeadConfig()).toThrow()
  vi.stubEnv('DEALER_ID', 'dealer'); vi.stubEnv('FORM_SUBMIT_WEBHOOK_URL', 'https://dms.example/webhook')
  expect(() => getLeadConfig()).toThrow()
  vi.stubEnv('EXTERNAL_NOTIFICATIONS_WEBHOOK_SECRET', 'secret')
  expect(getLeadConfig()).toEqual({ dealerId: 'dealer', secret: 'secret', url: 'https://dms.example/webhook' })
})
