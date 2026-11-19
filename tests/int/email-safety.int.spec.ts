// @vitest-environment node
import { expect, it, vi } from 'vitest'
const send = vi.hoisted(() => vi.fn().mockResolvedValue({ data: { id: 'email' } }))
vi.mock('resend', () => ({ Resend: class { emails = { send } } }))
import { escapeEmailData, sendEnquiryEmail } from '@/utilities/sendEmail'
it('escapes nested customer HTML without changing numeric fields', () => {
  expect(escapeEmailData({ notes: '<a href="evil">&\'</a>', vehicle: { price: 100 } })).toEqual({ notes: '&lt;a href=&quot;evil&quot;&gt;&amp;&#39;&lt;/a&gt;', vehicle: { price: 100 } })
})
it('reports provider errors and sends only to the configured recipient', async () => {
  vi.stubEnv('EMAIL_TO', 'dealer@example.com')
  send.mockResolvedValueOnce({ error: { message: 'Rejected' } })
  const result = await sendEnquiryEmail({ enquiryType: 'general-contact', personal: { firstName: '<script>bad</script>' } } as never)
  expect(result.success).toBe(false)
  expect(send.mock.calls[0][0].to).toEqual(['dealer@example.com'])
  expect(send.mock.calls[0][0].html).not.toContain('<script>')
  vi.unstubAllEnvs()
})
