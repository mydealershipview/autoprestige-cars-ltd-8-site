import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ connect: vi.fn(), find: vi.fn(), exec: vi.fn() }))
vi.mock('@/lib/db/connect', () => ({ default: mocks.connect }))
vi.mock('@/lib/db/models/soldCar.model', () => ({ default: { find: mocks.find } }))
import { clearLegacySoldCarsCache, readLegacySoldCars } from '@/lib/services/legacySoldCars'

beforeEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
  clearLegacySoldCarsCache()
  mocks.find.mockReturnValue({ select: () => ({ lean: () => ({ exec: mocks.exec }) }) })
})
describe('read-only legacy sold archive', () => {
  it('reads only explicitly selected cars regardless of their former thirty-day flag', async () => {
    mocks.exec.mockResolvedValue([{ stockId: 'old', soldDate: new Date('2020-01-01'), showAfter30Days: false, showOnSoldPage: true,
      vehicle: { vehicle: { make: 'BMW' }, metadata: { stockId: 'wrong', lifecycleState: 'FORECOURT' }, adverts: {}, media: { images: [{ href: 'https://m.atcdn.co.uk/{resize}/old.jpg' }] } } }])
    const [car] = await readLegacySoldCars()
    expect(mocks.find).toHaveBeenCalledWith({ showOnSoldPage: true })
    expect(car.metadata).toMatchObject({ stockId: 'old', lifecycleState: 'SOLD' })
    expect(car.soldAt).toBe('2020-01-01T00:00:00.000Z')
    expect(car.media.images[0].href).toContain('/w800/')
  })
  it('propagates Mongo failures', async () => {
    mocks.exec.mockRejectedValue(new Error('Mongo down'))
    await expect(readLegacySoldCars()).rejects.toThrow('Mongo down')
  })
  it('reads the archive once and serves it from memory after that (27/11/2026)', async () => {
    mocks.exec.mockResolvedValue([row('a')])
    await Promise.all([readLegacySoldCars(), readLegacySoldCars()])
    await readLegacySoldCars()
    expect(mocks.exec).toHaveBeenCalledTimes(1)
  })
  it('re-reads in the background after an hour, serving the copy in memory meanwhile', async () => {
    vi.useFakeTimers({ now: new Date('2026-11-27T10:00:00Z') })
    mocks.exec.mockResolvedValueOnce([row('a')]).mockResolvedValueOnce([row('b')])
    expect((await readLegacySoldCars()).map(c => c.metadata.stockId)).toEqual(['a'])
    vi.setSystemTime(new Date('2026-11-27T11:00:01Z'))
    expect((await readLegacySoldCars()).map(c => c.metadata.stockId)).toEqual(['a'])
    await vi.waitFor(() => expect(mocks.exec).toHaveBeenCalledTimes(2))
    await Promise.resolve()
    expect((await readLegacySoldCars()).map(c => c.metadata.stockId)).toEqual(['b'])
  })
  it('a failed background re-read keeps the last good copy', async () => {
    vi.useFakeTimers({ now: new Date('2026-11-27T10:00:00Z') })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.exec.mockResolvedValueOnce([row('a')]).mockRejectedValueOnce(new Error('Mongo down'))
    await readLegacySoldCars()
    vi.setSystemTime(new Date('2026-11-27T11:00:01Z'))
    expect((await readLegacySoldCars()).map(c => c.metadata.stockId)).toEqual(['a'])
    await vi.waitFor(() => expect(console.error).toHaveBeenCalled())
    expect((await readLegacySoldCars()).map(c => c.metadata.stockId)).toEqual(['a'])
  })
  it('a failed first read is not remembered: the next request tries again', async () => {
    mocks.exec.mockRejectedValueOnce(new Error('Mongo down')).mockResolvedValueOnce([row('a')])
    await expect(readLegacySoldCars()).rejects.toThrow('Mongo down')
    expect((await readLegacySoldCars()).map(c => c.metadata.stockId)).toEqual(['a'])
  })
})

function row(stockId: string) {
  return { stockId, soldDate: new Date('2020-01-01'), showOnSoldPage: true,
    vehicle: { vehicle: { make: 'BMW' }, metadata: { stockId }, adverts: {}, media: { images: [] } } }
}
