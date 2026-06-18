'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Reorder, useDragControls } from 'framer-motion'
import { ExternalLink, GripVertical, Plus, SquarePen, Trash2, X } from 'lucide-react'
import type { PanInfo } from 'framer-motion'
import type { RegPlate } from '@/lib/services/regPlates.service'

type FormState = {
  id: string | null
  plate: string
  price: string
  showPriceOnCard: boolean
  teaser: string
  details: string
  active: boolean
}

const DEFAULT_TEASER =
  "Should you require any further assistance please click the button, fill out the form and we'll be in touch as soon as possible. Alternatively Call us on 01274 488500"

const EMPTY_FORM: FormState = {
  id: null,
  plate: '',
  price: '',
  showPriceOnCard: true,
  teaser: DEFAULT_TEASER,
  details: '',
  active: true,
}

const inputClass =
  'w-full bg-[#111] border border-white/15 rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50'

const labelClass = 'text-[11px] font-bold uppercase tracking-widest text-gray-400'

function plateToForm(plate: RegPlate): FormState {
  return {
    id: plate.id,
    plate: plate.plate,
    price: plate.price == null ? '' : plate.price.toString(),
    showPriceOnCard: plate.showPriceOnCard,
    teaser: plate.teaser,
    details: plate.details,
    active: plate.active,
  }
}

function PlateRow({
  plate,
  draggable,
  deleting,
  onEdit,
  onDelete,
  onDragEnd,
}: {
  plate: RegPlate
  draggable: boolean
  deleting: boolean
  onEdit: (plate: RegPlate) => void
  onDelete: (plate: RegPlate) => void
  onDragEnd: () => void
}) {
  const controls = useDragControls()
  const priceLabel = plate.price == null
    ? 'POA'
    : `£${new Intl.NumberFormat('en-GB').format(plate.price)}`

  const content = (
    <div className="grid grid-cols-[36px_1fr] gap-2 rounded border border-white/10 bg-[#141414] px-3 py-3 md:grid-cols-[36px_1fr_130px_150px] md:items-center">
      <button
        type="button"
        disabled={!draggable}
        onPointerDown={(event) => {
          if (draggable) controls.start(event)
        }}
        className={`flex h-9 w-9 items-center justify-center rounded border !transition-colors ${
          draggable
            ? 'cursor-grab border-white/10 bg-white/5 text-gray-400 hover:border-amber-400/40 hover:text-amber-300 active:cursor-grabbing'
            : 'cursor-not-allowed border-white/5 bg-white/[0.03] text-gray-700'
        }`}
        aria-label={`Reorder ${plate.plate}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xl font-black uppercase tracking-wide">{plate.plate}</p>
          {!plate.active && (
            <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
              Hidden
            </span>
          )}
          {!plate.showPriceOnCard && (
            <span className="rounded border border-blue-400/25 bg-blue-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-300">
              Card price hidden
            </span>
          )}
        </div>
        <p className="truncate text-xs text-gray-500">{plate.teaser}</p>
      </div>

      <p className="ml-11 text-sm font-bold text-white md:ml-0">{priceLabel}</p>

      <div className="ml-11 flex items-center gap-2 md:ml-0 md:justify-end">
        <button
          type="button"
          onClick={() => onEdit(plate)}
          className="rounded border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-amber-400 hover:bg-amber-400/20 !transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => onDelete(plate)}
          className="inline-flex items-center justify-center rounded border border-red-400/30 bg-red-400/10 px-3 py-2 text-red-300 hover:bg-red-400/20 !transition-colors disabled:opacity-50"
          aria-label={`Delete ${plate.plate}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )

  if (!draggable) return content

  return (
    <Reorder.Item
      value={plate}
      dragListener={false}
      dragControls={controls}
      onDragEnd={(_event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => onDragEnd()}
      className="list-none"
      whileDrag={{ scale: 1.015, zIndex: 20 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {content}
    </Reorder.Item>
  )
}

export default function RegPlatesAdmin() {
  const [plates, setPlates] = useState<RegPlate[]>([])
  const platesRef = useRef<RegPlate[]>([])
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orderSaving, setOrderSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const setOrderedPlates = useCallback((nextPlates: RegPlate[]) => {
    setPlates(nextPlates)
    platesRef.current = nextPlates
  }, [])

  const fetchPlates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/reg-plates?includeInactive=true', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setOrderedPlates(data.plates ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reg plates')
    } finally {
      setLoading(false)
    }
  }, [setOrderedPlates])

  useEffect(() => {
    fetchPlates()
  }, [fetchPlates])

  const filteredPlates = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return plates
    return plates.filter((plate) => plate.plate.toLowerCase().includes(q))
  }, [plates, search])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setError(null)
    setNotice(null)
  }

  const persistOrder = async () => {
    if (search.trim()) return

    setOrderSaving(true)
    setError(null)
    setNotice(null)

    try {
      const res = await fetch('/api/reg-plates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: platesRef.current.map((plate) => plate.id) }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setNotice('Display order saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save display order')
      await fetchPlates()
    } finally {
      setOrderSaving(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setNotice(null)

    try {
      const payload = {
        plate: form.plate,
        price: form.price.trim() ? Number(form.price) : null,
        showPriceOnCard: form.showPriceOnCard,
        teaser: form.teaser,
        details: form.details,
        active: form.active,
      }

      const res = await fetch(form.id ? `/api/reg-plates/${form.id}` : '/api/reg-plates', {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setNotice(form.id ? 'Reg plate updated' : 'Reg plate added at top')
      resetForm()
      await fetchPlates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reg plate')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (plate: RegPlate) => {
    if (!window.confirm(`Delete ${plate.plate}? This removes it from the public reg plates page.`)) return

    setDeletingId(plate.id)
    setError(null)
    setNotice(null)

    try {
      const res = await fetch(`/api/reg-plates/${plate.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setNotice(`${plate.plate} deleted`)
      if (form.id === plate.id) resetForm()
      await fetchPlates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reg plate')
    } finally {
      setDeletingId(null)
    }
  }

  const canReorder = !search.trim() && !orderSaving

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {orderSaving && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded border border-white/10 bg-[#111] px-8 py-7 shadow-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
            <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white">
              Updating...
            </p>
            <p className="mt-1 text-xs text-gray-500">Saving reg plate order</p>
          </div>
        </div>
      )}

      <div className="border-b border-white/10 bg-[#111] px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-extrabold tracking-[0.15em] uppercase">Reg Plates</h1>
          <p className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wider font-medium">
            {loading ? 'Loading...' : `${plates.length} registrations`}
            {orderSaving ? ' · Saving order...' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/offers/reg-plates"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-white/10 rounded px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-300 hover:bg-white/5 !transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Page
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 p-4 md:p-6">
        <section className="min-w-0">
          <div className="mb-4 space-y-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search plates"
              className={inputClass}
            />
            <p className="text-[11px] text-gray-500">
              {canReorder
                ? 'Drag the handle on the left to reorder. The new order saves when you drop.'
                : 'Clear search to reorder the full list.'}
            </p>
          </div>

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-20 rounded bg-[#161616] animate-pulse" />
              ))}
            </div>
          )}

          {!loading && filteredPlates.length === 0 && (
            <div className="border border-white/10 rounded bg-[#111] px-6 py-12 text-center">
              <p className="font-semibold text-white">No reg plates found</p>
              <p className="text-sm text-gray-500 mt-1">Add one with the form on this page.</p>
            </div>
          )}

          {!loading && filteredPlates.length > 0 && (
            canReorder ? (
              <Reorder.Group
                axis="y"
                values={plates}
                onReorder={setOrderedPlates}
                className="space-y-2"
              >
                {plates.map((plate) => (
                  <PlateRow
                    key={plate.id}
                    plate={plate}
                    draggable
                    deleting={deletingId === plate.id}
                    onEdit={(nextPlate) => setForm(plateToForm(nextPlate))}
                    onDelete={handleDelete}
                    onDragEnd={persistOrder}
                  />
                ))}
              </Reorder.Group>
            ) : (
              <div className="space-y-2">
                {filteredPlates.map((plate) => (
                  <PlateRow
                    key={plate.id}
                    plate={plate}
                    draggable={false}
                    deleting={deletingId === plate.id}
                    onEdit={(nextPlate) => setForm(plateToForm(nextPlate))}
                    onDelete={handleDelete}
                    onDragEnd={persistOrder}
                  />
                ))}
              </div>
            )
          )}
        </section>

        <aside className="xl:sticky xl:top-6 h-fit rounded border border-white/10 bg-[#111] p-5">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-widest">
                {form.id ? 'Edit Reg Plate' : 'Add Reg Plate'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                New plates are added to the top automatically.
              </p>
            </div>
            {form.id && (
              <button type="button" onClick={resetForm} className="text-gray-500 hover:text-white !transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Plate</label>
              <input
                type="text"
                value={form.plate}
                onChange={(event) => setForm((prev) => ({ ...prev, plate: event.target.value.toUpperCase() }))}
                required
                placeholder="AB12 CDE"
                className={`${inputClass} bg-yellow-400 border-yellow-400 text-black! font-semibold uppercase placeholder-black/50 focus:border-yellow-300`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Price</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                placeholder="POA"
                className={inputClass}
              />
            </div>

            <label className="flex items-center justify-between gap-4 rounded border border-white/10 bg-black/30 px-3 py-2.5">
              <span>
                <span className="block text-xs font-bold uppercase tracking-wide text-white">Show Price On Card</span>
                <span className="block text-[11px] text-gray-500">Controls the public reg plates grid only</span>
              </span>
              <input
                type="checkbox"
                checked={form.showPriceOnCard}
                onChange={(event) => setForm((prev) => ({ ...prev, showPriceOnCard: event.target.checked }))}
                className="h-4 w-4 accent-amber-400"
              />
            </label>

            <div className="space-y-1.5">
              <label className={labelClass}>Card Text</label>
              <textarea
                rows={4}
                value={form.teaser}
                onChange={(event) => setForm((prev) => ({ ...prev, teaser: event.target.value }))}
                placeholder="Short text shown on the plate card"
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Detail Text</label>
              <textarea
                rows={4}
                value={form.details}
                onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
                placeholder="Longer text shown on the detail page"
                className={`${inputClass} resize-none`}
              />
            </div>

            <label className="flex items-center justify-between gap-4 rounded border border-white/10 bg-black/30 px-3 py-2.5">
              <span>
                <span className="block text-xs font-bold uppercase tracking-wide text-white">Visible</span>
                <span className="block text-[11px] text-gray-500">Show this plate publicly</span>
              </span>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
                className="h-4 w-4 accent-amber-400"
              />
            </label>

            {error && <p className="text-xs text-red-400">{error}</p>}
            {notice && <p className="text-xs text-emerald-400">{notice}</p>}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-amber-400 px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-black hover:bg-amber-300 !transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {form.id ? <SquarePen className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {saving ? 'Saving...' : form.id ? 'Save Changes' : 'Add Plate'}
            </button>
          </form>
        </aside>
      </div>
    </main>
  )
}
