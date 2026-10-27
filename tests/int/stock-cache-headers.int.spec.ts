// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ stock: vi.fn() }))
vi.mock('@/lib/services/dmsWebsiteStock', () => ({ getDmsWebsiteVehicles: mocks.stock }))
vi.mock('@/utilities/mergePayloadData', () => ({ mergeVehiclesWithPayloadData: async (rows: unknown[]) => rows }))
import { GET as featured } from '@/app/api/featured-vehicles/route'
import { GET as makes } from '@/app/api/available-makes-models/route'
const car = { metadata: { stockId: 'a', lifecycleState: 'FORECOURT' }, vehicle: { make: 'BMW', model: 'X1' }, adverts: {} }
beforeEach(() => vi.clearAllMocks())
describe('stock API caching', () => {
  it('lets browsers and CDNs reuse successful stock responses briefly', async () => {
    mocks.stock.mockResolvedValue([car])
    for (const response of [await featured(), await makes()]) {
      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toBe('public, max-age=60, s-maxage=300, stale-while-revalidate=60')
    }
  })
  it('never caches a failure', async () => {
    mocks.stock.mockRejectedValue(new Error('down'))
    for (const response of [await featured(), await makes()]) {
      expect(response.status).toBe(503)
      expect(response.headers.get('cache-control')).toBe('no-store')
    }
  })
})
