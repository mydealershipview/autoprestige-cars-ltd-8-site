import { fetchCombinedSoldVehicles } from './soldCars.service'

/**
 * Loads the sold cars as soon as the server starts and every 4 minutes after (27/11/2026), so no
 * visitor waits for them: not the first one after a deploy, nor one after a quiet night. 4 minutes
 * keeps the stock lists inside their 5-minute fresh / 15-minute stale window (dmsWebsiteStock.ts),
 * so a visitor is always served from memory. A failure is logged once per run of failures; the
 * visitor's request then loads (and reports) as before.
 */
const EVERY_MS = 4 * 60 * 1000

declare global {
  var __soldCarsWarmup: ReturnType<typeof setInterval> | undefined
}

export function startSoldCarsWarmup() {
  if (globalThis.__soldCarsWarmup) return
  let failing = false
  const run = () =>
    fetchCombinedSoldVehicles().then(
      () => { failing = false },
      error => {
        if (!failing) console.error('Sold cars warm-up failed; visitors will load them on request', error)
        failing = true
      },
    )
  void run()
  const timer = setInterval(run, EVERY_MS)
  timer.unref?.()
  globalThis.__soldCarsWarmup = timer
}
