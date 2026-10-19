import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ connect: vi.fn(), find: vi.fn(), exec: vi.fn() }))
vi.mock('@/lib/db/connect', () => ({ default: mocks.connect }))
vi.mock('@/lib/db/models/soldCar.model', () => ({ default: { find: mocks.find } }))
import { readLegacySoldCars } from '@/lib/services/legacySoldCars'

beforeEach(() => {
  vi.clearAllMocks()
  mocks.find.mockReturnValue({ select: () => ({ lean: () => ({ exec: mocks.exec }) }) })
})
describe('read-only legacy sold archive', () => {
  it('restores old cars regardless of their former thirty-day flag', async () => {
    mocks.exec.mockResolvedValue([{ stockId: 'old', soldDate: new Date('2020-01-01'), showAfter30Days: false,
      vehicle: { vehicle: { make: 'BMW' }, metadata: { stockId: 'wrong', lifecycleState: 'FORECOURT' }, adverts: {}, media: { images: [{ href: 'https://m.atcdn.co.uk/{resize}/old.jpg' }] } } }])
    const [car] = await readLegacySoldCars()
    expect(mocks.find).toHaveBeenCalledWith({})
    expect(car.metadata).toMatchObject({ stockId: 'old', lifecycleState: 'SOLD' })
    expect(car.soldAt).toBe('2020-01-01T00:00:00.000Z')
    expect(car.media.images[0].href).toContain('/w800/')
  })
  it('propagates Mongo failures', async () => {
    mocks.exec.mockRejectedValue(new Error('Mongo down'))
    await expect(readLegacySoldCars()).rejects.toThrow('Mongo down')
  })
})
