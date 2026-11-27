import { afterEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ combined: vi.fn() }))
vi.mock('@/lib/services/soldCars.service', () => ({ fetchCombinedSoldVehicles: mocks.combined }))
import { startSoldCarsWarmup } from '@/lib/services/soldCarsWarmup'

afterEach(() => {
  if (globalThis.__soldCarsWarmup) clearInterval(globalThis.__soldCarsWarmup)
  globalThis.__soldCarsWarmup = undefined
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('sold cars loaded from server start (27/11/2026)', () => {
  it('loads at once, then every 4 minutes, and starts only once', async () => {
    vi.useFakeTimers()
    mocks.combined.mockResolvedValue([])
    startSoldCarsWarmup()
    startSoldCarsWarmup()
    expect(mocks.combined).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(4 * 60 * 1000)
    expect(mocks.combined).toHaveBeenCalledTimes(2)
  })
  it('logs a run of failures once and keeps trying', async () => {
    vi.useFakeTimers()
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.combined.mockReset().mockRejectedValue(new Error('down'))
    startSoldCarsWarmup()
    await vi.advanceTimersByTimeAsync(8 * 60 * 1000)
    expect(mocks.combined).toHaveBeenCalledTimes(3)
    expect(log).toHaveBeenCalledTimes(1)
  })
})
