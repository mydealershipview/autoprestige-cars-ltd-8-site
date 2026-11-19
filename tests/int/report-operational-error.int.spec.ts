// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { reportOperationalError } from '@/utilities/reportOperationalError'
afterEach(() => { vi.restoreAllMocks() })
it('logs only the fixed error code (GlitchTip captures console errors, see src/instrumentation.ts)', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock)
  await reportOperationalError('dms_delivery_test')
  expect(log).toHaveBeenCalledWith('[dealer-site] dms_delivery_test')
  expect(fetchMock).not.toHaveBeenCalled() // no second, separate delivery to the monitoring server
  vi.unstubAllGlobals()
})
