'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AutoTraderVehicle } from '@/utilities/autotrader'
import { Make, Model } from '@/utilities/types'
import { formatPrice, generateVehicleSlug } from '@/utilities/formatVehicleData'
import { ChevronDown, Search, SlidersHorizontal, X, Pencil, CheckCircle, ExternalLink } from 'lucide-react'

interface ListingsFilters {
  make: string
  model: string
  minPrice: string
  maxPrice: string
  fuelType: string
  bodyType: string
  transmissionType: string
  minYear: string
  maxYear: string
  minMileage: string
  maxMileage: string
}

type ExtendedModel = Model & { makeName: string }

interface EditModalState {
  open: boolean
  vehicle: AutoTraderVehicle | null
  attentionGrabber: string
  reservationStatus: string
  listingPrice: string
}

const EMPTY_FILTERS: ListingsFilters = {
  make: '',
  model: '',
  minPrice: '',
  maxPrice: '',
  fuelType: '',
  bodyType: '',
  transmissionType: '',
  minYear: '',
  maxYear: '',
  minMileage: '',
  maxMileage: '',
}

export default function StockAdminComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [listings, setListings] = useState<AutoTraderVehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState(0)
  const [pageSize] = useState(50)

  const [sortBy, setSortBy] = useState('dateAdded')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<ExtendedModel[]>([])
  const [allModels, setAllModels] = useState<ExtendedModel[]>([])

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [editModal, setEditModal] = useState<EditModalState>({
    open: false,
    vehicle: null,
    attentionGrabber: '',
    reservationStatus: '',
    listingPrice: '',
  })

  const [overridesMap, setOverridesMap] = useState<Record<string, { attentionGrabber?: string | null; reservationStatus?: string | null; listingPrice?: number | null }>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const getFiltersFromParams = useCallback((): ListingsFilters => ({
    make: decodeURIComponent(searchParams.get('make') || ''),
    model: decodeURIComponent(searchParams.get('model') || ''),
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    fuelType: searchParams.get('fuelType') || '',
    bodyType: searchParams.get('bodyType') || '',
    transmissionType: searchParams.get('transmissionType') || '',
    minYear: searchParams.get('minYear') || '',
    maxYear: searchParams.get('maxYear') || '',
    minMileage: searchParams.get('minMileage') || '',
    maxMileage: searchParams.get('maxMileage') || '',
  }), [searchParams])

  const filters = getFiltersFromParams()
  const totalPages = Math.ceil(totalResults / pageSize)
  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  const fetchListings = async (
    page: number,
    currentFilters: ListingsFilters,
    currentSortBy?: string,
    currentSortOrder?: 'asc' | 'desc',
  ) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy: currentSortBy || sortBy,
        sortOrder: currentSortOrder || sortOrder,
      })
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })

      const res = await fetch(`/api/listings?${queryParams}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      setListings(data.results)
      setTotalResults(data.totalResults)

      if (data.availableMakes) setMakes(data.availableMakes)
      if (data.availableModels) {
        setAllModels(data.availableModels)
        const filtered = currentFilters.make
          ? data.availableModels.filter((m: any) => {
            const mk = data.availableMakes?.find((mk: any) => mk.name === currentFilters.make)
            return mk && m.makeId === mk.makeId
          })
          : []
        setModels(filtered)
      }

      // Fetch overrides for all vehicles on this page
      if (data.results?.length > 0) {
        const ids = (data.results as AutoTraderVehicle[]).map((v) => v.metadata?.stockId).filter(Boolean).join(',')
        try {
          const ovRes = await fetch(`/api/vehicle-overrides?stockIds=${ids}`)
          if (ovRes.ok) {
            const ovData = await ovRes.json()
            setOverridesMap(ovData.overrides ?? {})
          }
        } catch {
          // non-fatal — overrides just won't show
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings(currentPage, filters, sortBy, sortOrder)
  }, [
    currentPage, sortBy, sortOrder,
    filters.make, filters.model,
    filters.minPrice, filters.maxPrice,
    filters.fuelType, filters.bodyType,
    filters.transmissionType,
    filters.minYear, filters.maxYear,
    filters.minMileage, filters.maxMileage,
  ])

  const updateURL = useCallback(
    (newFilters: ListingsFilters, page = 1, newSortBy?: string, newSortOrder?: 'asc' | 'desc') => {
      const params = new URLSearchParams()
      if (page > 1) params.set('page', page.toString())
      const sb = newSortBy || sortBy
      const so = newSortOrder || sortOrder
      if (sb !== 'dateAdded' || so !== 'desc') {
        params.set('sortBy', sb)
        params.set('sortOrder', so)
      }
      Object.entries(newFilters).forEach(([k, v]) => { if (v) params.set(k, v) })
      router.push(params.toString() ? `?${params.toString()}` : '/stock-admin', { scroll: false })
    },
    [router, sortBy, sortOrder],
  )

  const handleFilterChange = (key: keyof ListingsFilters, value: string) => {
    updateURL({ ...filters, [key]: value }, 1)
  }

  const handleMakeChange = (makeName: string) => {
    setModels(allModels.filter((m) => m.makeName === makeName))
    updateURL({ ...filters, make: makeName, model: '' }, 1)
  }

  const handleClearFilters = () => {
    setModels([])
    updateURL(EMPTY_FILTERS, 1)
  }

  const handlePageChange = (page: number) => updateURL(filters, page)

  const handleSortChange = (value: string) => {
    const idx = value.lastIndexOf('-')
    const sb = value.substring(0, idx)
    const so = value.substring(idx + 1) as 'asc' | 'desc'
    setSortBy(sb)
    setSortOrder(so)
    updateURL(filters, 1, sb, so)
    fetchListings(1, filters, sb, so)
  }

  const openEdit = (vehicle: AutoTraderVehicle) => {
    const stockId = vehicle.metadata?.stockId
    const existingOverride = stockId ? overridesMap[stockId] : undefined
    const price = existingOverride?.listingPrice != null
      ? existingOverride.listingPrice
      : (vehicle.adverts?.forecourtPrice?.amountGBP ?? vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP ?? null)
    const grabber = existingOverride?.attentionGrabber != null
      ? existingOverride.attentionGrabber
      : (vehicle.adverts?.retailAdverts?.attentionGrabber ?? '')
    const resStatus = existingOverride?.reservationStatus != null
      ? existingOverride.reservationStatus
      : (vehicle.adverts?.retailAdverts?.reservationStatus ?? '')
    setEditModal({
      open: true,
      vehicle,
      attentionGrabber: grabber || '',
      reservationStatus: resStatus || '',
      listingPrice: price != null ? price.toString() : '',
    })
  }

  const closeEdit = () => {
    setEditModal({ open: false, vehicle: null, attentionGrabber: '', reservationStatus: '', listingPrice: '' })
    setSaveError(null)
  }

  const handleSaveOverride = async () => {
    if (!editModal.vehicle) return
    const stockId = editModal.vehicle.metadata?.stockId
    if (!stockId) return

    setIsSaving(true)
    setSaveError(null)
    try {
      const body: { attentionGrabber?: string | null; reservationStatus?: string | null; listingPrice?: number | null } = {}

      // Only include fields the admin touched (or explicitly cleared)
      body.attentionGrabber = editModal.attentionGrabber.trim() || null
      body.reservationStatus = editModal.reservationStatus.trim() || null
      body.listingPrice = editModal.listingPrice !== '' ? Number(editModal.listingPrice) : null

      const res = await fetch(`/api/vehicle-overrides/${stockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      const { override } = await res.json()
      // Update local overrides map so the CheckCircle appears without a full reload
      setOverridesMap((prev) => ({ ...prev, [stockId]: override }))
      closeEdit()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return listings
    const q = searchQuery.toLowerCase()
    return listings.filter((v) => {
      const make = (v.vehicle?.make || v.vehicle?.standard?.make || '').toLowerCase()
      const model = (v.vehicle?.model || v.vehicle?.standard?.model || '').toLowerCase()
      const reg = (v.vehicle?.registration || '').toLowerCase()
      return make.includes(q) || model.includes(q) || reg.includes(q)
    })
  }, [listings, searchQuery])

  // ── Sidebar accordion
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    manufacturer: true, model: false, price: false,
    bodyType: false, fuelType: false, transmission: false,
    year: false, mileage: false,
  })
  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))

  const selectCls = 'w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30'

  const FilterSection = ({
    sectionKey, label, isActive, children,
  }: { sectionKey: string; label: string; isActive?: boolean; children: React.ReactNode }) => (
    <div className="border-b border-white/10">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-white/5 !transition-colors"
      >
        <span className={`text-sm font-semibold tracking-wide uppercase ${isActive ? 'text-amber-400' : 'text-white'}`}>
          {label}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 !transition-transform ${openSections[sectionKey] ? 'rotate-180' : ''}`} />
      </button>
      {openSections[sectionKey] && <div className="px-5 pb-4 pt-1 space-y-2">{children}</div>}
    </div>
  )

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear()
    return Array.from({ length: y - 1949 }, (_, i) => (y - i).toString())
  }, [])

  const mileageOptions = [
    { label: 'Any', value: '' }, { label: '5,000', value: '5000' },
    { label: '10,000', value: '10000' }, { label: '20,000', value: '20000' },
    { label: '30,000', value: '30000' }, { label: '50,000', value: '50000' },
    { label: '75,000', value: '75000' }, { label: '100,000', value: '100000' },
    { label: '150,000', value: '150000' },
  ]

  const priceOptions = [
    { label: 'Any', value: '' }, { label: '£5,000', value: '5000' },
    { label: '£10,000', value: '10000' }, { label: '£15,000', value: '15000' },
    { label: '£20,000', value: '20000' }, { label: '£30,000', value: '30000' },
    { label: '£40,000', value: '40000' }, { label: '£50,000', value: '50000' },
    { label: '£75,000', value: '75000' }, { label: '£100,000', value: '100000' },
  ]

  const formatMileage = (m: number | null) =>
    m == null ? '—' : new Intl.NumberFormat('en-GB').format(m)

  const daysInStock = (dateOnForecourt: string | undefined) => {
    if (!dateOnForecourt) return '—'
    const diff = Math.floor((Date.now() - new Date(dateOnForecourt).getTime()) / 86400000)
    return `${diff}d`
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── Top bar ── */}
      <div className="border-b border-white/10 bg-[#111] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold tracking-[0.15em] uppercase">Stock Admin</h1>
          <p className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wider font-medium">
            {loading ? 'Loading…' : `${totalResults} vehicles`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 rounded">
            Admin
          </span>
        </div>
      </div>

      {/* ── Mobile filter backdrop ── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileFiltersOpen(false)} />
      )}

      <div className="flex min-h-[calc(100vh-70px)]">
        {/* ── Sidebar ── */}
        <aside className={`${mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky inset-y-0 left-0 z-50 lg:z-auto w-72 lg:w-52 shrink-0 border-r border-white/10 bg-[#0d0d0d] flex flex-col top-0 h-screen overflow-y-auto scrollbar-thin !transition-transform !duration-300`}>
          <div className="px-5 pt-5 pb-4 border-b border-white/10 flex items-center justify-between">
            <p className="text-sm font-extrabold tracking-widest uppercase">Filters</p>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button onClick={handleClearFilters} className="text-[10px] text-amber-400 hover:text-amber-300 !transition-colors uppercase tracking-wide">
                  Clear
                </button>
              )}
              <button onClick={() => setMobileFiltersOpen(false)} className="lg:hidden text-gray-400 hover:text-white !transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <FilterSection sectionKey="manufacturer" label="Manufacturer" isActive={!!filters.make}>
            <select value={filters.make} onChange={(e) => handleMakeChange(e.target.value)} className={selectCls}>
              <option value="">All Makes</option>
              {makes.map((m) => <option key={m.makeId} value={m.name}>{m.name}</option>)}
            </select>
          </FilterSection>

          <FilterSection sectionKey="model" label="Model" isActive={!!filters.model}>
            <select value={filters.model} onChange={(e) => handleFilterChange('model', e.target.value)} disabled={!filters.make} className={`${selectCls} disabled:opacity-40`}>
              <option value="">All Models</option>
              {models.map((m) => <option key={m.modelId} value={m.name}>{m.name}</option>)}
            </select>
          </FilterSection>

          <FilterSection sectionKey="price" label="Price" isActive={!!(filters.minPrice || filters.maxPrice)}>
            <div className="grid grid-cols-2 gap-1.5">
              <select value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className={selectCls}>
                <option value="">From</option>
                {priceOptions.filter(o => o.value).map(o => <option key={`pf-${o.value}`} value={o.value}>{o.label}</option>)}
              </select>
              <select value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className={selectCls}>
                <option value="">To</option>
                {priceOptions.filter(o => o.value).map(o => <option key={`pt-${o.value}`} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </FilterSection>

          <FilterSection sectionKey="bodyType" label="Body Type" isActive={!!filters.bodyType}>
            <select value={filters.bodyType} onChange={(e) => handleFilterChange('bodyType', e.target.value)} className={selectCls}>
              <option value="">Any</option>
              {['Saloon', 'Hatchback', 'SUV', 'Coupe', 'Convertible', 'Estate', 'MPV'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FilterSection>

          <FilterSection sectionKey="fuelType" label="Fuel Type" isActive={!!filters.fuelType}>
            <select value={filters.fuelType} onChange={(e) => handleFilterChange('fuelType', e.target.value)} className={selectCls}>
              <option value="">Any</option>
              {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FilterSection>

          <FilterSection sectionKey="transmission" label="Transmission" isActive={!!filters.transmissionType}>
            <select value={filters.transmissionType} onChange={(e) => handleFilterChange('transmissionType', e.target.value)} className={selectCls}>
              <option value="">Any</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </FilterSection>

          <FilterSection sectionKey="year" label="Year" isActive={!!(filters.minYear || filters.maxYear)}>
            <div className="grid grid-cols-2 gap-1.5">
              <select value={filters.minYear} onChange={(e) => handleFilterChange('minYear', e.target.value)} className={selectCls}>
                <option value="">From</option>
                {yearOptions.map(y => <option key={`yf-${y}`} value={y}>{y}</option>)}
              </select>
              <select value={filters.maxYear} onChange={(e) => handleFilterChange('maxYear', e.target.value)} className={selectCls}>
                <option value="">To</option>
                {yearOptions.map(y => <option key={`yt-${y}`} value={y}>{y}</option>)}
              </select>
            </div>
          </FilterSection>

          <FilterSection sectionKey="mileage" label="Mileage" isActive={!!(filters.minMileage || filters.maxMileage)}>
            <div className="grid grid-cols-2 gap-1.5">
              <select value={filters.minMileage} onChange={(e) => handleFilterChange('minMileage', e.target.value)} className={selectCls}>
                <option value="">From</option>
                {mileageOptions.filter(o => o.value).map(o => <option key={`mf-${o.value}`} value={o.value}>{o.label}</option>)}
              </select>
              <select value={filters.maxMileage} onChange={(e) => handleFilterChange('maxMileage', e.target.value)} className={selectCls}>
                <option value="">To</option>
                {mileageOptions.filter(o => o.value).map(o => <option key={`mt-${o.value}`} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </FilterSection>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#0d0d0d] sticky top-0 z-10">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 bg-[#1a1a1a] border border-white/10 px-3 py-2 text-white shrink-0 hover:border-white/30 !transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wide uppercase">Filters</span>
              {hasActiveFilters && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
            </button>

            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search make, model or reg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded pl-10 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
              />
            </div>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none shrink-0"
            >
              <option value="dateAdded-desc">Newest First</option>
              <option value="dateAdded-asc">Oldest First</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="mileage-asc">Mileage: Low → High</option>
              <option value="year-desc">Year: Newest</option>
              <option value="make-asc">Make A–Z</option>
            </select>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-[#1a1a1a] rounded h-20 animate-pulse" />
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-red-400 font-medium mb-2">Failed to load stock</p>
                <p className="text-gray-500 text-sm mb-5">{error}</p>
                <button
                  onClick={() => fetchListings(currentPage, filters, sortBy, sortOrder)}
                  className="px-6 py-2.5 bg-white text-black rounded font-semibold text-sm hover:bg-gray-100 !transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filteredListings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-white font-medium mb-2">No vehicles found</p>
                <button onClick={handleClearFilters} className="px-6 py-2 bg-white text-black rounded font-semibold text-sm hover:bg-gray-100 !transition-colors mt-3">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Vehicle table */}
            {!loading && !error && filteredListings.length > 0 && (
              <>
                {/* Desktop table header */}
                <div className="hidden md:grid grid-cols-[64px_1fr_110px_60px_100px_90px_80px_80px_140px] gap-x-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-white/10 mb-1">
                  <span></span>
                  <span>Vehicle</span>
                  <span>Registration</span>
                  <span>Year</span>
                  <span>Mileage</span>
                  <span>Trans.</span>
                  <span>Days</span>
                  <span>Price</span>
                  <span className="text-center">Actions</span>
                </div>

                <div className="space-y-1.5">
                  {filteredListings.map((vehicle) => {
                    const stockId = vehicle.metadata?.stockId || ''
                    const make = vehicle.vehicle?.make || vehicle.vehicle?.standard?.make || ''
                    const model = vehicle.vehicle?.model || vehicle.vehicle?.standard?.model || ''
                    const derivative = vehicle.vehicle?.derivative || vehicle.vehicle?.standard?.derivative || ''
                    const year = vehicle.vehicle?.yearOfManufacture
                    const mileage = vehicle.vehicle?.odometerReadingMiles
                    const transmission = vehicle.vehicle?.transmissionType || vehicle.vehicle?.standard?.transmissionType || ''
                    const reg = vehicle.vehicle?.registration || '—'
                    const price = vehicle.adverts?.forecourtPrice?.amountGBP
                      ?? vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP
                      ?? null
                    const grabber = vehicle.adverts?.retailAdverts?.attentionGrabber
                    const imageUrl = vehicle.media?.images?.[0]?.href || ''
                    const days = daysInStock(vehicle.metadata?.dateOnForecourt)
                    const hasOverride = !!overridesMap[stockId]
                    const slug = generateVehicleSlug(vehicle)

                    return (
                      <div
                        key={stockId}
                        className="bg-[#141414] border border-white/5 rounded hover:border-white/15 !transition-colors group"
                      >
                        {/* Mobile layout */}
                        <div className="md:hidden flex gap-3 p-3">
                          {imageUrl ? (
                            <img src={imageUrl} alt={`${make} ${model}`} className="w-20 h-16 object-cover rounded shrink-0 bg-white/5" />
                          ) : (
                            <div className="w-20 h-16 bg-white/5 rounded shrink-0 flex items-center justify-center text-gray-700 text-[10px]">No img</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-extrabold uppercase tracking-wide text-sm leading-tight">{make} {model}</p>
                                {derivative && <p className="text-[10px] text-gray-500 truncate">{derivative}</p>}
                              </div>
                              {hasOverride && <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[10px] text-gray-400">
                              <span>{reg}</span>
                              {year && <span>{year}</span>}
                              {mileage != null && <span>{formatMileage(mileage)} mi</span>}
                              {transmission && <span>{transmission}</span>}
                              <span>{days} in stock</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm font-bold text-white">{price ? formatPrice(price) : 'POA'}</span>
                              <div className="flex items-center gap-1.5">
                                <Link
                                  href={`/usedcars/${slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide bg-white/5 border border-white/15 text-gray-300 hover:bg-white/10 px-2.5 py-1 rounded !transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View
                                </Link>
                                <button
                                  onClick={() => openEdit(vehicle)}
                                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 px-2.5 py-1 rounded !transition-colors"
                                >
                                  <Pencil className="w-3 h-3" />
                                  Edit
                                </button>
                              </div>
                            </div>
                            {grabber && (
                              <p className="text-[10px] text-blue-400/80 italic truncate mt-1">&quot;{grabber}&quot;</p>
                            )}
                          </div>
                        </div>

                        {/* Desktop table row */}
                        <div className="hidden md:grid grid-cols-[64px_1fr_110px_60px_100px_90px_80px_80px_140px] gap-x-3 items-center px-3 py-2.5">
                          {/* Thumbnail */}
                          {imageUrl ? (
                            <img src={imageUrl} alt={`${make} ${model}`} className="w-14 h-10 object-cover rounded bg-white/5" />
                          ) : (
                            <div className="w-14 h-10 bg-white/5 rounded flex items-center justify-center text-gray-700 text-[9px]">No img</div>
                          )}

                          {/* Vehicle name */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold uppercase tracking-wide text-sm truncate">{make} {model}</p>
                              {hasOverride && <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                            </div>
                            {derivative && <p className="text-[10px] text-gray-500 truncate">{derivative}</p>}
                            {grabber && <p className="text-[10px] text-blue-400/70 italic truncate">&quot;{grabber}&quot;</p>}
                          </div>

                          {/* Reg */}
                          <span className="text-sm font-mono text-gray-300">{reg}</span>

                          {/* Year */}
                          <span className="text-sm text-gray-300">{year ?? '—'}</span>

                          {/* Mileage */}
                          <span className="text-sm text-gray-300">{mileage != null ? `${formatMileage(mileage)} mi` : '—'}</span>

                          {/* Transmission */}
                          <span className="text-xs text-gray-400 truncate">{transmission || '—'}</span>

                          {/* Days in stock */}
                          <span className="text-xs text-gray-400">{days}</span>

                          {/* Price */}
                          <span className="text-sm font-bold text-white">{price ? formatPrice(price) : 'POA'}</span>

                          {/* Actions */}
                          <div className="flex justify-center items-center gap-1.5">
                            <Link
                              href={`/usedcars/${slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide bg-white/5 border border-white/15 text-gray-300 hover:bg-white/10 px-2 py-1.5 rounded !transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </Link>
                            <button
                              onClick={() => openEdit(vehicle)}
                              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 px-2 py-1.5 rounded !transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 mb-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded border border-white/10 text-sm text-gray-400 hover:border-white/30 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed !transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let page: number
                      if (totalPages <= 7) {
                        page = i + 1
                      } else if (currentPage <= 4) {
                        page = i + 1
                      } else if (currentPage >= totalPages - 3) {
                        page = totalPages - 6 + i
                      } else {
                        page = currentPage - 3 + i
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-9 h-9 rounded border text-sm font-semibold !transition-colors ${page === currentPage
                              ? 'bg-amber-400 text-black border-amber-400'
                              : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                            }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded border border-white/10 text-sm text-gray-400 hover:border-white/30 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed !transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editModal.open && editModal.vehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg w-full max-w-lg shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <h2 className="font-extrabold uppercase tracking-wide text-sm">
                  {editModal.vehicle.vehicle?.make || ''} {editModal.vehicle.vehicle?.model || ''}
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {editModal.vehicle.vehicle?.registration || ''} ·{' '}
                  {editModal.vehicle.metadata?.stockId || ''}
                </p>
              </div>
              <button onClick={closeEdit} className="text-gray-400 hover:text-white !transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vehicle summary */}
            <div className="px-5 pt-4 pb-2 flex gap-4">
              {editModal.vehicle.media?.images?.[0]?.href && (
                <img
                  src={editModal.vehicle.media.images[0].href}
                  alt="vehicle"
                  className="w-28 h-20 object-cover rounded bg-white/5 shrink-0"
                />
              )}
              <div className="text-sm text-gray-400 space-y-1">
                <p><span className="text-gray-600 text-xs uppercase tracking-wide">Year</span> {editModal.vehicle.vehicle?.yearOfManufacture ?? '—'}</p>
                <p><span className="text-gray-600 text-xs uppercase tracking-wide">Mileage</span> {editModal.vehicle.vehicle?.odometerReadingMiles != null ? `${formatMileage(editModal.vehicle.vehicle.odometerReadingMiles)} mi` : '—'}</p>
                <p>
                  <span className="text-gray-600 text-xs uppercase tracking-wide">DMS Price</span>{' '}
                  <span className="text-white font-bold">
                    {(editModal.vehicle.adverts?.forecourtPrice?.amountGBP ??
                      editModal.vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP) != null
                      ? formatPrice(
                        editModal.vehicle.adverts?.forecourtPrice?.amountGBP ??
                        editModal.vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP
                      )
                      : 'POA'}
                  </span>
                </p>
              </div>
            </div>

            {/* Editable fields */}
            <div className="px-5 pb-5 space-y-4">
              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mb-3">Override Fields</p>

                {/* Listing Price */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Listing Price (£)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder={`DMS price: ${editModal.vehicle.adverts?.forecourtPrice?.amountGBP ?? editModal.vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP ?? '—'}`}
                    value={editModal.listingPrice}
                    onChange={(e) => setEditModal((prev) => ({ ...prev, listingPrice: e.target.value }))}
                    className="w-full bg-[#111] border border-white/15 rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50"
                  />
                  <p className="text-[10px] text-gray-600">Leave empty to use DMS price.</p>
                </div>

                {/* Attention Grabber */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Attention Grabber
                  </label>
                  <textarea
                    rows={3}
                    placeholder={editModal.vehicle.adverts?.retailAdverts?.attentionGrabber || 'e.g. Great condition, full service history, one owner…'}
                    value={editModal.attentionGrabber}
                    onChange={(e) => setEditModal((prev) => ({ ...prev, attentionGrabber: e.target.value }))}
                    className="w-full bg-[#111] border border-white/15 rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 resize-none"
                  />
                  <p className="text-[10px] text-gray-600">Leave empty to use DMS attention grabber.</p>
                </div>

                {/* Reservation Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Reservation Status
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Reserved — contact us to enquire"
                    value={editModal.reservationStatus}
                    onChange={(e) => setEditModal((prev) => ({ ...prev, reservationStatus: e.target.value }))}
                    className="w-full bg-[#111] border border-white/15 rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-400/50 resize-none"
                  />
                  <p className="text-[10px] text-gray-600">Shown as a second banner below attention grabber. Leave empty to hide.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeEdit}
                  className="flex-1 py-2.5 border border-white/10 rounded text-sm font-semibold text-gray-400 hover:bg-white/5 !transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOverride}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-amber-400 text-black rounded text-sm font-extrabold uppercase tracking-wide hover:bg-amber-300 !transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving…' : 'Save Override'}
                </button>
              </div>
              {saveError && (
                <p className="text-[11px] text-red-400 text-center">{saveError}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
