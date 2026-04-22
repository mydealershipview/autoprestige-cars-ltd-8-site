import { NextRequest, NextResponse } from 'next/server'
import { fetchAutoTraderListings, AutoTraderVehicle } from '../../../utilities/autotrader'
import { extractMakesAndModelsFromVehicles } from '../../../utilities/make-model'
import { mergeVehiclesWithPayloadData } from '../../../utilities/mergePayloadData'

// Cache for storing all listings
let allListingsCache: AutoTraderVehicle[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Fetch all listings from AutoTrader
async function fetchAllListings(): Promise<AutoTraderVehicle[]> {
  // Check cache first
  if (allListingsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return allListingsCache
  }

  const allListings: AutoTraderVehicle[] = []
  let page = 1
  let hasMoreData = true
  const pageSize = 100 // Fetch larger chunks

  // Try MyDealershipView API first
  try {
    console.log('Fetching all listings from MyDealershipView API...')
    const allListings: AutoTraderVehicle[] = []
    let currentPage = 1
    let hasMoreData = true

    while (hasMoreData) {
      const myDealershipUrl = `${process.env.DMS_URL}?dealerEmail=${process.env.DEALER_EMAIL}&pageSize=${pageSize}&page=${currentPage}`
      
      const response = await fetch(myDealershipUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`MyDealershipView API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const results = data.data?.vehicles || []
      const status = new Set(results.map((vehicle: any) => vehicle.metadata.lifecycleState))
      
      if (results.length > 0) {
        const filteredResults = results.filter((vehicle: any) => vehicle.metadata.lifecycleState === 'SOLD')
        allListings.push(...filteredResults)
        
        // Check if there are more pages
        const total = data.data?.pagination?.totalResults || filteredResults.length
        const totalPages = Math.ceil(total / pageSize)
        hasMoreData = currentPage < totalPages
        currentPage++
      } else {
        hasMoreData = false
      }
    }
    
    // Update cache
    allListingsCache = allListings
    cacheTimestamp = Date.now()
    
    console.log(`Retrieved ${allListings.length} vehicles from MyDealershipView API`)
    return allListings
  } catch (error) {
    console.error('MyDealershipView API error:', error)
    
    // Fallback to AutoTrader data
    try {
      console.log('Falling back to AutoTrader API for all listings')
      while (hasMoreData) {
        const response = await fetchAutoTraderListings({
          page,
          pageSize
        })

        if (response.results && response.results.length > 0) {
          allListings.push(...response.results)
          
          // Check if there are more pages
          const totalPages = Math.ceil(response.totalResults / pageSize)
          hasMoreData = page < totalPages
          page++
        } else {
          hasMoreData = false
        }
      }

      // Update cache
      allListingsCache = allListings
      cacheTimestamp = Date.now()

      console.log(`Fallback: Retrieved ${allListings.length} vehicles from AutoTrader API`)
      return allListings
    } catch (error) {
      console.error('AutoTrader fallback also failed:', error)
      // Return cached data if available, otherwise empty array
      return allListingsCache || []
    }
  }
}

// Filter function
function filterListings(listings: AutoTraderVehicle[], filters: {
  make?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  minMileage?: number
  maxMileage?: number
  fuelType?: string
  bodyType?: string
  transmissionType?: string
  minYear?: number
  maxYear?: number
}): AutoTraderVehicle[] {
  return listings.filter(vehicle => {
    // Make filter
    if (filters.make) {
      const vehicleMake = vehicle.vehicle.make || vehicle.vehicle.standard?.make
      if (!vehicleMake || vehicleMake.toLowerCase() !== filters.make.toLowerCase()) {
        return false
      }
    }

    // Model filter
    if (filters.model) {
      const vehicleModel = vehicle.vehicle.model || vehicle.vehicle.standard?.model
      if (!vehicleModel || vehicleModel.toLowerCase() !== filters.model.toLowerCase()) {
        return false
      }
    }

    // Price filters
    const price = vehicle.adverts?.forecourtPrice?.amountGBP || vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP
    if (typeof filters.minPrice === 'number') {
      if (typeof price !== 'number' || price < filters.minPrice) {
        return false
      }
    }
    if (typeof filters.maxPrice === 'number') {
      if (typeof price !== 'number' || price > filters.maxPrice) {
        return false
      }
    }

    // Mileage filters
    const mileage = vehicle.vehicle.odometerReadingMiles
    if (typeof filters.minMileage === 'number') {
      if (typeof mileage !== 'number' || mileage < filters.minMileage) {
        return false
      }
    }
    if (typeof filters.maxMileage === 'number') {
      if (typeof mileage !== 'number' || mileage > filters.maxMileage) {
        return false
      }
    }

    // Fuel type filter
    if (filters.fuelType) {
      const vehicleFuelType = vehicle.vehicle.fuelType || vehicle.vehicle.standard?.fuelType
      if (!vehicleFuelType || vehicleFuelType.toLowerCase() !== filters.fuelType.toLowerCase()) {
        return false
      }
    }

    // Body type filter
    if (filters.bodyType) {
      const vehicleBodyType = vehicle.vehicle.bodyType || vehicle.vehicle.standard?.bodyType
      if (!vehicleBodyType || vehicleBodyType.toLowerCase() !== filters.bodyType.toLowerCase()) {
        return false
      }
    }

    // Transmission type filter
    if (filters.transmissionType) {
      const vehicleTransmission = vehicle.vehicle.transmissionType || vehicle.vehicle.standard?.transmissionType
      if (!vehicleTransmission || vehicleTransmission.toLowerCase() !== filters.transmissionType.toLowerCase()) {
        return false
      }
    }

    // Year filters
    const vehicleYear = vehicle.vehicle.yearOfManufacture
    if (typeof filters.minYear === 'number') {
      if (typeof vehicleYear !== 'number' || vehicleYear < filters.minYear) {
        return false
      }
    }
    if (typeof filters.maxYear === 'number') {
      if (typeof vehicleYear !== 'number' || vehicleYear > filters.maxYear) {
        return false
      }
    }

    return true
  })
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
    const make = searchParams.get('make') ? decodeURIComponent(searchParams.get('make')!) : undefined
    const model = searchParams.get('model') ? decodeURIComponent(searchParams.get('model')!) : undefined
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined
    const minMileage = searchParams.get('minMileage') ? parseInt(searchParams.get('minMileage')!) : undefined
    const maxMileage = searchParams.get('maxMileage') ? parseInt(searchParams.get('maxMileage')!) : undefined
    const fuelType = searchParams.get('fuelType') || undefined
    const bodyType = searchParams.get('bodyType') || undefined
    const transmissionType = searchParams.get('transmissionType') || undefined
    const minYear = searchParams.get('minYear') ? parseInt(searchParams.get('minYear')!) : undefined
    const maxYear = searchParams.get('maxYear') ? parseInt(searchParams.get('maxYear')!) : undefined
    const sortBy = searchParams.get('sortBy') || 'dateAdded'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Validate page and pageSize
    if (page < 1 || pageSize < 1) {
      return NextResponse.json(
        { error: 'Invalid page or pageSize parameters' },
        { status: 400 }
      )
    }

    // Fetch all listings
    const allListings = await fetchAllListings()

    // Apply filters using names directly
    const filteredListings = filterListings(allListings, {
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
    })

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
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Listings API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}
