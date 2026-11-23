import { stockCacheHeaders, noStoreHeaders } from '@/utilities/stockCacheHeaders'
import { getDmsWebsiteVehicles } from '@/lib/services/dmsWebsiteStock'
import { NextRequest, NextResponse } from 'next/server'
import { AutoTraderVehicle } from '../../../utilities/autotrader'
import { extractMakesAndModelsFromVehicles } from '../../../utilities/make-model'
import { mergeVehiclesWithPayloadData } from '../../../utilities/mergePayloadData'
import { filterVehicles, filtersFromParams, toFacetRow } from '../../../utilities/stockFilters'

async function fetchAllListings(): Promise<AutoTraderVehicle[]> {
  return getDmsWebsiteVehicles('live')
}

// Sort function
function sortListings(listings: AutoTraderVehicle[], sortBy: string, sortOrder: 'asc' | 'desc'): AutoTraderVehicle[] {
  return [...listings].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortBy) {
      case 'price':
        aValue = a.adverts?.forecourtPrice?.amountGBP || a.adverts?.retailAdverts?.totalPrice?.amountGBP || 0
        bValue = b.adverts?.forecourtPrice?.amountGBP || b.adverts?.retailAdverts?.totalPrice?.amountGBP || 0
        break
      
      case 'year':
        aValue = a.vehicle.yearOfManufacture || 0
        bValue = b.vehicle.yearOfManufacture || 0
        break
      
      case 'mileage':
        aValue = a.vehicle.odometerReadingMiles || 999999
        bValue = b.vehicle.odometerReadingMiles || 999999
        break
      
      case 'make':
        aValue = (a.vehicle.make || a.vehicle.standard?.make || '').toLowerCase()
        bValue = (b.vehicle.make || b.vehicle.standard?.make || '').toLowerCase()
        break
      
      case 'model':
        aValue = (a.vehicle.model || a.vehicle.standard?.model || '').toLowerCase()
        bValue = (b.vehicle.model || b.vehicle.standard?.model || '').toLowerCase()
        break
      
      case 'fuelType':
        aValue = (a.vehicle.fuelType || a.vehicle.standard?.fuelType || '').toLowerCase()
        bValue = (b.vehicle.fuelType || b.vehicle.standard?.fuelType || '').toLowerCase()
        break
      
      case 'dateAdded':
        aValue = new Date(a.metadata.dateOnForecourt || a.metadata.lastUpdated).getTime()
        bValue = new Date(b.metadata.dateOnForecourt || b.metadata.lastUpdated).getTime()
        break
      
      default:
        return 0
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (sortOrder === 'asc') {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const sortBy = searchParams.get('sortBy') || 'dateAdded'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Validate page and pageSize
    if (page < 1 || pageSize < 1) {
      return NextResponse.json(
        { error: 'Invalid page or pageSize parameters' },
        { status: 400, headers: noStoreHeaders }
      )
    }

    // Fetch all listings
    const allListings = await fetchAllListings()

    // Apply filters (one definition shared with the stock list's option counts)
    const filteredListings = filterVehicles(allListings, filtersFromParams(searchParams))

    // Apply sorting
    const sortedListings = sortListings(filteredListings, sortBy, sortOrder)

    // Apply pagination
    const totalResults = sortedListings.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedListings = sortedListings.slice(startIndex, endIndex)

    // Merge paginated listings with Payload data efficiently
    const mergedListings = paginatedListings.length > 0 ? await mergeVehiclesWithPayloadData(paginatedListings) : []

    // Extract makes and models from all listings (not just paginated)
    const availableMakesModels = extractMakesAndModelsFromVehicles(allListings)

    const response = {
      results: mergedListings,
      totalResults,
      pageSize,
      page,
      availableMakes: availableMakesModels.makes,
      availableModels: availableMakesModels.models,
      // Filter values of every car in stock, so the page can show live option counts
      facets: allListings.map(toFacetRow),
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
