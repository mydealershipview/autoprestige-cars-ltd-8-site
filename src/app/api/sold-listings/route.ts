import { stockCacheHeaders, noStoreHeaders } from '@/utilities/stockCacheHeaders'
import { NextRequest, NextResponse } from 'next/server'
import { extractMakesAndModelsFromVehicles } from '../../../utilities/make-model'
import { querySoldCarListings } from '@/lib/services/soldCars.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('pageSize') ?? 20)
    const make = searchParams.get('make') ? searchParams.get('make')!.trim() : undefined
    const model = searchParams.get('model') ? searchParams.get('model')!.trim() : undefined
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')!) : undefined
    const minMileage = searchParams.get('minMileage') ? Number(searchParams.get('minMileage')!) : undefined
    const maxMileage = searchParams.get('maxMileage') ? Number(searchParams.get('maxMileage')!) : undefined
    const fuelType = searchParams.get('fuelType') || undefined
    const bodyType = searchParams.get('bodyType') || undefined
    const transmissionType = searchParams.get('transmissionType') || undefined
    const colour = searchParams.get('colour') || undefined
    const search = searchParams.get('search')?.trim().slice(0, 100) || undefined
    const minYear = searchParams.get('minYear') ? Number(searchParams.get('minYear')!) : undefined
    const maxYear = searchParams.get('maxYear') ? Number(searchParams.get('maxYear')!) : undefined
    const sortBy = searchParams.get('sortBy') || 'dateAdded'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Validate page and pageSize
    if (!Number.isSafeInteger(page) || !Number.isSafeInteger(pageSize) || page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: 'Invalid page or pageSize parameters' },
        { status: 400, headers: noStoreHeaders }
      )
    }

    if (!['asc', 'desc'].includes(sortOrder) || !['price', 'year', 'mileage', 'make', 'model', 'fuelType', 'dateAdded'].includes(sortBy)) {
      return NextResponse.json({ error: 'Invalid sort' }, { status: 400, headers: noStoreHeaders })
    }

    for (const [min, max] of [[minPrice, maxPrice], [minMileage, maxMileage], [minYear, maxYear]]) {
      if ([min, max].some(value => value !== undefined && (!Number.isFinite(value) || value < 0)) ||
          (min !== undefined && max !== undefined && min > max)) {
        return NextResponse.json({ error: 'Invalid numeric range' }, { status: 400, headers: noStoreHeaders })
      }
    }

    // Filter and paginate the deduplicated union, never each source independently.
    const { vehicles: pageListings, totalResults, makeModelVehicles, page: actualPage } = await querySoldCarListings({
      page,
      pageSize,
      sortBy,
      sortOrder,
      make,
      model,
      minPrice,
      maxPrice,
      minMileage,
      maxMileage,
      fuelType,
      bodyType,
      transmissionType,
      minYear,
      maxYear,
      colour,
      search,
    })

    // Never let old website overrides replace DMS sold-ad text or price
    const mergedListings = pageListings

    // Makes and models from every visible sold car (not just this page), for the filters
    const availableMakesModels = extractMakesAndModelsFromVehicles(makeModelVehicles)

    const response = {
      results: mergedListings,
      totalResults,
      pageSize,
      page: actualPage,
      availableMakes: availableMakesModels.makes,
      availableModels: availableMakesModels.models,
    }

    return NextResponse.json(response, { headers: stockCacheHeaders })
  } catch (error) {
    console.error('Listings API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500, headers: noStoreHeaders }
    )
  }
}
