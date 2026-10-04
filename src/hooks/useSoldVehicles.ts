'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AutoTraderVehicle } from '@/utilities/autotrader'

/** Load sold showcases without allowing an old request to replace newer results. */
export function useSoldVehicles(url: string) {
  const [vehicles, setVehicles] = useState<AutoTraderVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        if (!Array.isArray(data.results)) throw new Error('Invalid sold vehicles response')
        if (!controller.signal.aborted) setVehicles(data.results)
      } catch {
        if (!controller.signal.aborted) setError('Could not load previously sold vehicles.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [url, attempt])

  return { vehicles, loading, error, retry }
}
