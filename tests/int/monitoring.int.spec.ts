// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { reportOperationalError } from '@/utilities/reportOperationalError'
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })
it('reports a fixed error code without credentials or customer context, throttled per code', async () => {
  vi.stubEnv('GLITCHTIP_DSN', 'https://public-key@monitor.example/7')
  const fetchMock = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal('fetch', fetchMock)
  await reportOperationalError('dms_delivery_test')
  await reportOperationalError('dms_delivery_test')
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock.mock.calls[0][0]).toBe('https://monitor.example/api/7/store/')
  const event = JSON.parse(fetchMock.mock.calls[0][1].body)
  expect(event.message).toBe('dms_delivery_test')
  expect(JSON.stringify(event)).not.toContain('public-key')
})
