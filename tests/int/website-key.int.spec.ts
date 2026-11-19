// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { websiteStockUrl, getDmsWebsiteInventoryVehicles } from '@/lib/services/dmsWebsiteStock'
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })
it('requires a key, removes legacy identity from stock URLs and authenticates the request', async () => {
  vi.stubEnv('DMS_URL', 'https://dms.example/stock?dealerEmail=wrong&dealerId=wrong')
  vi.stubEnv('DMS_WEBSITE_KEY', '')
  vi.stubEnv('DEALER_EMAIL', '')
  expect(() => websiteStockUrl('live')).toThrow()
  vi.stubEnv('DMS_WEBSITE_KEY', 'private-key')
  const url = websiteStockUrl('live')
  expect(url.searchParams.has('dealerEmail')).toBe(false)
  expect(url.searchParams.has('dealerId')).toBe(false)
  expect(url.toString()).not.toContain('private-key')
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { vehicles: [], pagination: { totalPages: 0 } } })))
  vi.stubGlobal('fetch', fetchMock)
  await getDmsWebsiteInventoryVehicles()
  expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer private-key' })
})
it('keeps working with the dealer email until the website key is configured', async () => {
  vi.stubEnv('DMS_URL', 'https://dms.example/stock')
  vi.stubEnv('DMS_WEBSITE_KEY', '')
  vi.stubEnv('DEALER_EMAIL', 'dealer@example.com')
  expect(websiteStockUrl('live').searchParams.get('dealerEmail')).toBe('dealer@example.com')
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { vehicles: [], pagination: { totalPages: 0 } } })))
  vi.stubGlobal('fetch', fetchMock)
  await getDmsWebsiteInventoryVehicles()
  expect(fetchMock.mock.calls[0][1].headers).toEqual({})
})
