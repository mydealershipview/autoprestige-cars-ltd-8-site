'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckSquare, ExternalLink, RefreshCcw, Search, Square, ToggleLeft, ToggleRight } from 'lucide-react'
import type { AutoTraderVehicle } from '@/utilities/autotrader'
import { formatPrice, generateVehicleSlug } from '@/utilities/formatVehicleData'

type SoldCarAdminRecord = {
  id: string
  stockId: string
  registration: string | null
  make: string | null
  model: string | null
  derivative: string | null
  soldDate: string
  firstSeenAt: string
  showAfter30Days: boolean
  vehicle: AutoTraderVehicle
}

type FilterMode = 'all' | 'enabled' | 'recent'

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const daysSince = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000))
}

const formatMileage = (value: number | null | undefined) =>
  value == null ? '-' : `${new Intl.NumberFormat('en-GB').format(value)} mi`

export default function SoldCarsAdmin() {
  const [cars, setCars] = useState<SoldCarAdminRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const fetchCars = useCallback(async (sync = true) => {
    setError(null)
    setLoading((current) => current || !sync)
    setSyncing(sync)

    try {
      const res = await fetch(`/api/sold-cars?sync=${sync ? 'true' : 'false'}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setCars(data.cars ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sold cars')
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    fetchCars(true)
  }, [fetchCars])

  const filteredCars = useMemo(() => {
    const q = search.trim().toLowerCase()

    return cars.filter((car) => {
      const age = daysSince(car.soldDate)
      const isRecent = age != null && age < 30

      if (filterMode === 'enabled' && !car.showAfter30Days) return false
      if (filterMode === 'recent' && !isRecent) return false
      if (!q) return true

      const vehicle = car.vehicle
      return [
        car.stockId,
        car.registration,
        car.make,
        car.model,
        car.derivative,
        vehicle.vehicle?.registration,
        vehicle.vehicle?.make,
        vehicle.vehicle?.model,
        vehicle.vehicle?.derivative,
      ].some((value) => value?.toLowerCase().includes(q))
    })
  }, [cars, filterMode, search])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const visibleIds = filteredCars.map((car) => car.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id))
  const enabledCount = cars.filter((car) => car.showAfter30Days).length
  const recentCount = cars.filter((car) => {
    const age = daysSince(car.soldDate)
    return age != null && age < 30
  }).length

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleVisibleSelection = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) return prev.filter((id) => !visibleIds.includes(id))
      return Array.from(new Set([...prev, ...visibleIds]))
    })
  }

  const updateLocalCars = (ids: string[], showAfter30Days: boolean) => {
    setCars((prev) => prev.map((car) => (ids.includes(car.id) ? { ...car, showAfter30Days } : car)))
  }

  const bulkUpdate = async (showAfter30Days: boolean) => {
    if (selectedIds.length === 0) return

    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/sold-cars', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, showAfter30Days }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      updateLocalCars(selectedIds, showAfter30Days)
      setSelectedIds([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update selected sold cars')
    } finally {
      setSaving(false)
    }
  }

  const toggleRow = async (car: SoldCarAdminRecord) => {
    const nextValue = !car.showAfter30Days
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/sold-cars/${car.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showAfter30Days: nextValue }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      updateLocalCars([car.id], nextValue)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sold car')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {(syncing || saving) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded border border-white/10 bg-[#111] px-8 py-7 shadow-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
            <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white">
              {syncing ? 'Syncing...' : 'Updating...'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {syncing ? 'Checking DMS sold vehicles' : 'Saving sold car visibility'}
            </p>
          </div>
        </div>
      )}

      <div className="border-b border-white/10 bg-[#111] px-6 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-extrabold uppercase tracking-[0.15em]">Sold Cars Admin</h1>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">
              {loading ? 'Loading...' : `${cars.length} sold cars · ${enabledCount} extended · ${recentCount} under 30 days`}
            </p>
          </div>
          <button
            onClick={() => fetchCars(true)}
            disabled={loading || syncing || saving}
            className="inline-flex items-center justify-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-gray-300 !transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCcw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync DMS
          </button>
        </div>
      </div>

      <div className="border-b border-white/10 bg-[#0d0d0d] px-4 py-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search make, model, reg or stock ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#1a1a1a] py-2 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:border-white/30 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'enabled', label: 'Extended' },
              { value: 'recent', label: 'Under 30 Days' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilterMode(item.value as FilterMode)}
                className={`rounded px-3 py-2 text-xs font-extrabold uppercase tracking-wide !transition-colors ${
                  filterMode === item.value
                    ? 'bg-amber-400 text-black'
                    : 'border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleVisibleSelection}
              disabled={visibleIds.length === 0 || saving}
              className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-gray-300 !transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {allVisibleSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {allVisibleSelected ? 'Clear Visible' : 'Select Visible'}
            </button>
            <button
              onClick={() => bulkUpdate(true)}
              disabled={selectedIds.length === 0 || saving}
              className="rounded bg-amber-400 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-black !transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Show After 30 Days
            </button>
            <button
              onClick={() => bulkUpdate(false)}
              disabled={selectedIds.length === 0 || saving}
              className="rounded border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-gray-300 !transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Hide After 30 Days
            </button>
          </div>
        </div>
        {selectedIds.length > 0 && (
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-amber-400">
            {selectedIds.length} selected
          </p>
        )}
      </div>

      <div className="p-4">
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded bg-[#1a1a1a]" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="mb-2 font-medium text-red-400">Failed to load sold cars</p>
            <p className="mb-5 text-sm text-gray-500">{error}</p>
            <button onClick={() => fetchCars(false)} className="rounded bg-white px-6 py-2.5 text-sm font-semibold text-black !transition-colors hover:bg-gray-100">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredCars.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="mb-2 font-medium text-white">No sold cars found</p>
            <p className="text-sm text-gray-500">Try a different filter or sync DMS again.</p>
          </div>
        )}

        {!loading && !error && filteredCars.length > 0 && (
          <>
            <div className="mb-1 hidden grid-cols-[42px_64px_1fr_110px_86px_94px_128px_150px] gap-x-3 border-b border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 md:grid">
              <span />
              <span />
              <span>Vehicle</span>
              <span>Registration</span>
              <span>Sold</span>
              <span>Age</span>
              <span>Visibility</span>
              <span className="text-center">Actions</span>
            </div>

            <div className="space-y-1.5">
              {filteredCars.map((car) => {
                const vehicle = car.vehicle
                const make = vehicle.vehicle?.make || vehicle.vehicle?.standard?.make || car.make || ''
                const model = vehicle.vehicle?.model || vehicle.vehicle?.standard?.model || car.model || ''
                const derivative = vehicle.vehicle?.derivative || vehicle.vehicle?.standard?.derivative || car.derivative || ''
                const reg = vehicle.vehicle?.registration || car.registration || '-'
                const imageUrl = vehicle.media?.images?.[0]?.href || ''
                const price = vehicle.adverts?.forecourtPrice?.amountGBP ?? vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP ?? null
                const mileage = vehicle.vehicle?.odometerReadingMiles
                const age = daysSince(car.soldDate)
                const isRecent = age != null && age < 30
                const slug = generateVehicleSlug(vehicle)
                const selected = selectedSet.has(car.id)
                const visibilityLabel = car.showAfter30Days ? 'Extended' : isRecent ? 'Under 30' : 'Hidden'

                return (
                  <div key={car.id} className={`rounded border bg-[#141414] !transition-colors ${selected ? 'border-amber-400/40' : 'border-white/5 hover:border-white/15'}`}>
                    <div className="flex gap-3 p-3 md:hidden">
                      <button onClick={() => toggleSelected(car.id)} disabled={saving} className="mt-0.5 text-gray-400 !transition-colors hover:text-white disabled:opacity-40" aria-label={selected ? 'Deselect sold car' : 'Select sold car'}>
                        {selected ? <CheckSquare className="h-5 w-5 text-amber-400" /> : <Square className="h-5 w-5" />}
                      </button>
                      {imageUrl ? (
                        <img src={imageUrl} alt={`${make} ${model}`} className="h-16 w-20 shrink-0 rounded bg-white/5 object-cover" />
                      ) : (
                        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded bg-white/5 text-[10px] text-gray-700">No img</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold uppercase tracking-wide">{make} {model}</p>
                            {derivative && <p className="truncate text-[10px] text-gray-500">{derivative}</p>}
                          </div>
                          <button onClick={() => toggleRow(car)} disabled={saving} className={`shrink-0 !transition-colors disabled:opacity-40 ${car.showAfter30Days ? 'text-amber-400' : 'text-gray-500 hover:text-white'}`} aria-label="Toggle show after 30 days">
                            {car.showAfter30Days ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                          </button>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-400">
                          <span>{reg}</span>
                          <span>{formatDate(car.soldDate)}</span>
                          <span>{age == null ? '-' : `${age}d`}</span>
                          <span>{price ? formatPrice(price) : 'POA'}</span>
                          <span>{formatMileage(mileage)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${car.showAfter30Days ? 'bg-amber-400/10 text-amber-400' : isRecent ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-gray-500'}`}>
                            {visibilityLabel}
                          </span>
                          <Link href={`/usedcars/${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-300 !transition-colors hover:bg-white/10">
                            <ExternalLink className="h-3 w-3" />
                            View
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="hidden grid-cols-[42px_64px_1fr_110px_86px_94px_128px_150px] items-center gap-x-3 px-3 py-2.5 md:grid">
                      <button onClick={() => toggleSelected(car.id)} disabled={saving} className="text-gray-400 !transition-colors hover:text-white disabled:opacity-40" aria-label={selected ? 'Deselect sold car' : 'Select sold car'}>
                        {selected ? <CheckSquare className="h-5 w-5 text-amber-400" /> : <Square className="h-5 w-5" />}
                      </button>
                      {imageUrl ? (
                        <img src={imageUrl} alt={`${make} ${model}`} className="h-10 w-14 rounded bg-white/5 object-cover" />
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded bg-white/5 text-[9px] text-gray-700">No img</div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold uppercase tracking-wide">{make} {model}</p>
                        {derivative && <p className="truncate text-[10px] text-gray-500">{derivative}</p>}
                        <p className="truncate text-[10px] text-gray-600">{price ? formatPrice(price) : 'POA'} · {formatMileage(mileage)}</p>
                      </div>
                      <span className="font-mono text-sm text-gray-300">{reg}</span>
                      <span className="text-xs text-gray-400">{formatDate(car.soldDate)}</span>
                      <span className="text-xs text-gray-400">{age == null ? '-' : `${age}d`}</span>
                      <span className={`w-fit rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${car.showAfter30Days ? 'bg-amber-400/10 text-amber-400' : isRecent ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-gray-500'}`}>
                        {visibilityLabel}
                      </span>
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => toggleRow(car)} disabled={saving} className={`inline-flex items-center gap-1.5 rounded border px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide !transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${car.showAfter30Days ? 'border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20' : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                          {car.showAfter30Days ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                          Toggle
                        </button>
                        <Link href={`/usedcars/${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded border border-white/15 bg-white/5 px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-300 !transition-colors hover:bg-white/10">
                          <ExternalLink className="h-3 w-3" />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
