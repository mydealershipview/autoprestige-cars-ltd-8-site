'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AutoTraderVehicle } from '@/utilities/autotrader'
import { Make, Model } from '@/utilities/types'
import { formatPrice, generateVehicleSlug } from '@/utilities/formatVehicleData'
import { Car, SlidersHorizontal } from 'lucide-react'

interface UsedCarsComponentProps {
  listingsData?: unknown
}

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
  colour: string
  minMileage: string
  maxMileage: string
}

type ExtendedModel = Model & {
  makeName: string
}

export default function UsedCarsComponent({ listingsData: _listingsData }: UsedCarsComponentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [listings, setListings] = useState<AutoTraderVehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState(0)
  const [pageSize] = useState(20)

  // Sorting state
  const [sortBy, setSortBy] = useState('price')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Make and Model state
  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<ExtendedModel[]>([])
  const [allModels, setAllModels] = useState<ExtendedModel[]>([])
  const [makesModelsLoaded, setMakesModelsLoaded] = useState(false)
  
  // Get current page from URL params
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const headerRef = useRef<HTMLHeadingElement>(null)

  // Get sorting from URL params
  useEffect(() => {
    const urlSortBy = searchParams.get('sortBy') || 'price'
    const urlSortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    setSortBy(urlSortBy)
    setSortOrder(urlSortOrder)
  }, [searchParams])

  // Get filters from URL params
  const getFiltersFromParams = useCallback((): ListingsFilters => {
    return {
      make: decodeURIComponent(searchParams.get('make') || ''),
      model: decodeURIComponent(searchParams.get('model') || ''),
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      fuelType: searchParams.get('fuelType') || '',
      bodyType: searchParams.get('bodyType') || '',
      transmissionType: searchParams.get('transmissionType') || '',
      minYear: searchParams.get('minYear') || '',
      maxYear: searchParams.get('maxYear') || '',
      colour: searchParams.get('colour') || '',
      minMileage: searchParams.get('minMileage') || '',
      maxMileage: searchParams.get('maxMileage') || '',
    }
  }, [searchParams])

  const filters = getFiltersFromParams()

  const totalPages = Math.ceil(totalResults / pageSize)

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

      // Add filters to query params
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value)
        }
      })

      const response = await fetch(`/api/listings?${queryParams}`, { cache: 'no-store' })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setListings(data.results)
      setTotalResults(data.totalResults)

      // Update makes and models from the response
      if (data.availableMakes) {
        setMakes(data.availableMakes)
      }
      if (data.availableModels) {
        setAllModels(data.availableModels)
        if (!makesModelsLoaded) {
          setMakesModelsLoaded(true)
        }
      }

      // Filter models for the selected make
      if (data.availableModels) {
        const filteredModels = currentFilters.make
          ? data.availableModels.filter((model: any) => {
              const selectedMakeObj = data.availableMakes?.find(
                (make: any) => make.name === currentFilters.make,
              )
              return selectedMakeObj && model.makeId === selectedMakeObj.makeId
            })
          : []
        setModels(filteredModels)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings')
    } finally {
      setLoading(false)
    }
  }

  // Load listings on component mount and when parameters change
  useEffect(() => {
    fetchListings(currentPage, filters, sortBy, sortOrder)
  }, [
    currentPage,
    sortBy,
    sortOrder,
    filters.make,
    filters.model,
    filters.minPrice,
    filters.maxPrice,
    filters.fuelType,
    filters.bodyType,
    filters.transmissionType,
    filters.minYear,
    filters.maxYear,
    filters.colour,
    filters.minMileage,
    filters.maxMileage,
  ])

  const updateURL = useCallback(
    (
      newFilters: ListingsFilters,
      page: number = 1,
      newSortBy?: string,
      newSortOrder?: 'asc' | 'desc',
    ) => {
      const params = new URLSearchParams()

      if (page > 1) {
        params.set('page', page.toString())
      }

      const currentSortBy = newSortBy || sortBy
      const currentSortOrder = newSortOrder || sortOrder
      if (currentSortBy !== 'price' || currentSortOrder !== 'desc') {
        params.set('sortBy', currentSortBy)
        params.set('sortOrder', currentSortOrder)
      }

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })

      const newURL = params.toString() ? `?${params.toString()}` : '/usedcars'
      router.push(newURL, { scroll: false })
    },
    [router, sortBy, sortOrder],
  )

  const handleFilterChange = (key: keyof ListingsFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    updateURL(newFilters, 1, sortBy, sortOrder)
  }

  // Handle make change
  const handleMakeChange = (makeName: string) => {
    const newFilters = { ...filters, make: makeName, model: '' }
    setModels(allModels.filter((model) => model.makeName === makeName))
    updateURL(newFilters, 1, sortBy, sortOrder)
  }

  // Handle model change
  const handleModelChange = (modelName: string) => {
    const newFilters = { ...filters, model: modelName }
    updateURL(newFilters, 1, sortBy, sortOrder)
  }

  const handleClearFilters = () => {
    const clearedFilters: ListingsFilters = {
      make: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      fuelType: '',
      bodyType: '',
      transmissionType: '',
      minYear: '',
      maxYear: '',
      colour: '',
      minMileage: '',
      maxMileage: '',
    }
    updateURL(clearedFilters, 1, sortBy, sortOrder)
    setModels([])
  }

  const handlePageChange = (page: number) => {
    updateURL(filters, page, sortBy, sortOrder)
    setTimeout(() => window.scrollTo(0, 0), 0)
  }

  const formatMileage = (mileage: number | null) => {
    if (mileage == null) return null
    return `${new Intl.NumberFormat('en-GB').format(mileage)} mi`
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  const inputCls =
    'h-12 w-full rounded-xl border border-white/10 bg-[#101010] px-4 text-sm font-semibold text-white placeholder:text-gray-600 focus:border-[#c8e63c] focus:outline-none'
  const selectCls =
    'h-12 w-full rounded-xl border border-white/10 bg-[#151515] px-4 text-sm font-semibold text-white focus:border-[#c8e63c] focus:outline-none'

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const filteredListings = listings
  const makeOptions = makes.length
    ? makes
    : [
        { makeId: 'fallback-bmw', name: 'BMW' },
        { makeId: 'fallback-hyundai', name: 'Hyundai' },
        { makeId: 'fallback-land-rover', name: 'Land Rover' },
        { makeId: 'fallback-mazda', name: 'Mazda' },
        { makeId: 'fallback-peugeot', name: 'Peugeot' },
        { makeId: 'fallback-vauxhall', name: 'Vauxhall' },
        { makeId: 'fallback-volkswagen', name: 'Volkswagen' },
      ]

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#111] text-white">
      <style jsx global>{`
        body > header,
        body > nav {
          display: none !important;
        }
      `}</style>

      <nav className="border-b border-white/5 bg-[#111]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex h-14 w-24 items-center overflow-hidden">
            <img src="/logo2.png" alt="Motor Time Group" className="h-full w-full scale-150 object-cover object-center" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-gray-400 transition-colors hover:text-white">
              Home
            </Link>
            <a href="tel:07441940552" className="text-sm font-black text-[#c8e63c] transition-colors hover:text-[#b8d632]">
              07441 940552
            </a>
          </div>
        </div>
      </nav>

      <section className="border-b border-white/5 bg-[#151515]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-gray-600">Motor Time Group</p>
              <h1 ref={headerRef} className="text-4xl font-black uppercase leading-none text-white">
                Our Stock
              </h1>
              <p className="mt-3 text-sm font-semibold text-gray-400">
                {loading
                  ? 'Loading vehicles...'
                  : `${totalResults || filteredListings.length} vehicle${(totalResults || filteredListings.length) === 1 ? '' : 's'} available`}
              </p>
            </div>
            <button
              onClick={() => setMobileFiltersOpen((open) => !open)}
              aria-expanded={mobileFiltersOpen}
              aria-controls="stock-filters"
              className={`inline-flex w-fit items-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition-colors ${
                mobileFiltersOpen
                  ? 'border-[#c8e63c] bg-[#c8e63c] text-black hover:bg-[#b8d632]'
                  : 'border-white/15 bg-transparent text-gray-300 hover:border-[#c8e63c] hover:text-white'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          <div
            id="stock-filters"
            className={`${mobileFiltersOpen ? 'grid' : 'hidden'} rounded-2xl border border-white/10 bg-[#181818] p-5`}
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="space-y-2">
                <span className="block text-xs font-black uppercase tracking-[0.16em] text-gray-500">Make</span>
                <select value={filters.make} onChange={(e) => handleMakeChange(e.target.value)} className={selectCls}>
                  <option value="">Any make</option>
                  {makeOptions.map((make) => (
                    <option key={make.makeId} value={make.name}>
                      {make.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-black uppercase tracking-[0.16em] text-gray-500">Model</span>
                <select value={filters.model} onChange={(e) => handleModelChange(e.target.value)} disabled={!filters.make} className={`${selectCls} disabled:opacity-50`}>
                  <option value="">{filters.make ? 'Any model' : 'Select make first'}</option>
                  {models.map((model) => (
                    <option key={model.modelId} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-black uppercase tracking-[0.16em] text-gray-500">Fuel Type</span>
                <select value={filters.fuelType} onChange={(e) => handleFilterChange('fuelType', e.target.value)} className={selectCls}>
                  <option value="">Any fuel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-black uppercase tracking-[0.16em] text-gray-500">Transmission</span>
                <select value={filters.transmissionType} onChange={(e) => handleFilterChange('transmissionType', e.target.value)} className={selectCls}>
                  <option value="">Any transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-black uppercase tracking-[0.16em] text-gray-500">Body Style</span>
                <select value={filters.bodyType} onChange={(e) => handleFilterChange('bodyType', e.target.value)} className={selectCls}>
                  <option value="">Any body style</option>
                  <option value="Saloon">Saloon</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="SUV">SUV</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Estate">Estate</option>
                  <option value="MPV">MPV</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-black uppercase tracking-[0.16em] text-gray-500">Min Price</span>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-600">£</span>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="1500"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-black uppercase tracking-[0.16em] text-gray-500">Max Price</span>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-600">£</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="37000"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </label>

              {hasActiveFilters && (
                <div className="flex items-end">
                  <button onClick={handleClearFilters} className="h-12 rounded-xl border border-white/10 px-4 text-sm font-bold text-gray-300 transition-colors hover:border-[#c8e63c] hover:text-[#c8e63c]">
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-xl bg-[#1c1c1c]">
                <div className="aspect-[4/3] animate-pulse bg-white/5" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="py-24 text-center">
            <p className="mb-2 font-semibold text-[#c8e63c]">Failed to load listings</p>
            <p className="mb-5 text-sm text-gray-500">{error}</p>
            <button onClick={() => fetchListings(currentPage, filters, sortBy, sortOrder)} className="rounded bg-[#c8e63c] px-6 py-2.5 text-sm font-black text-black hover:bg-[#b8d632]">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredListings.length === 0 && (
          <div className="py-24 text-center">
            <Car className="mx-auto mb-4 h-12 w-12 text-gray-700" />
            <p className="mb-2 font-semibold text-white">No vehicles found</p>
            <p className="mb-5 text-sm text-gray-500">Try adjusting your filters</p>
            <button onClick={handleClearFilters} className="rounded bg-[#c8e63c] px-6 py-2.5 text-sm font-black text-black hover:bg-[#b8d632]">
              Clear Filters
            </button>
          </div>
        )}

        {!loading && !error && filteredListings.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredListings.map((vehicle, index) => {
                const stockId = vehicle.metadata?.stockId || ''
                const slug = generateVehicleSlug(vehicle)
                const imageUrl = vehicle.media?.images?.[0]?.href
                const vehicleMake = vehicle.vehicle?.make || vehicle.vehicle?.standard?.make || ''
                const vehicleModel = vehicle.vehicle?.model || vehicle.vehicle?.standard?.model || ''
                const vehicleYear = vehicle.vehicle?.yearOfManufacture
                const vehicleMileage = vehicle.vehicle?.odometerReadingMiles
                const vehicleFuelType = vehicle.vehicle?.fuelType || vehicle.vehicle?.standard?.fuelType || ''
                const vehicleTransmission = vehicle.vehicle?.transmissionType || vehicle.vehicle?.standard?.transmissionType || ''
                const vehiclePrice =
                  vehicle.adverts?.forecourtPrice?.amountGBP ??
                  vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP ??
                  null
                const mileageStr = formatMileage(vehicleMileage)
                const attentionGrabber = vehicle.adverts?.retailAdverts?.attentionGrabber

                return (
                  <Link
                    key={stockId || slug}
                    href={`/usedcars/${slug}`}
                    className="group flex min-h-[420px] flex-col overflow-hidden rounded-xl bg-[#1c1c1c] transition-all hover:ring-1 hover:ring-[#c8e63c]/40"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#111]">
                      {attentionGrabber ? (
                        <div className="absolute left-3 top-3 z-10 rounded bg-[#c8e63c] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-black">
                          {attentionGrabber}
                        </div>
                      ) : index === 1 ? (
                        <div className="absolute left-3 top-3 z-10 rounded bg-[#c8e63c] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-black">
                          Great Price
                        </div>
                      ) : null}
                      {imageUrl ? (
                        <img src={imageUrl} alt={`${vehicleMake} ${vehicleModel}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Car className="h-12 w-12 text-slate-700" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">{vehicleMake}</p>
                      <h2 className="mb-2 text-xl font-black leading-tight text-white">{vehicleModel}</h2>
                      <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-gray-500">
                        {vehicleYear ? <span>{vehicleYear}</span> : null}
                        {mileageStr ? (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-700" />
                            <span>{mileageStr}</span>
                          </>
                        ) : null}
                        {vehicleFuelType ? (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-700" />
                            <span>{vehicleFuelType}</span>
                          </>
                        ) : null}
                        {vehicleTransmission ? (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-700" />
                            <span>{vehicleTransmission}</span>
                          </>
                        ) : null}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3">
                        <p className="min-w-0 text-[clamp(1.45rem,1.45vw,1.75rem)] font-black leading-none text-[#c8e63c]">
                          {vehiclePrice ? formatPrice(vehiclePrice) : 'POA'}
                        </p>
                        <span className="shrink-0 whitespace-nowrap rounded-xl border border-white/20 px-4 py-2 text-sm font-black text-white transition-colors group-hover:border-[#c8e63c] group-hover:text-[#c8e63c]">
                          View Details
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded border border-white/10 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-[#c8e63c] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number
                  if (totalPages <= 7) page = i + 1
                  else if (currentPage <= 4) page = i + 1
                  else if (currentPage >= totalPages - 3) page = totalPages - 6 + i
                  else page = currentPage - 3 + i
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-9 w-9 rounded border text-sm transition-colors ${
                        currentPage === page
                          ? 'border-[#c8e63c] bg-[#c8e63c] font-black text-black'
                          : 'border-white/10 text-gray-400 hover:border-[#c8e63c] hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded border border-white/10 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-[#c8e63c] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
