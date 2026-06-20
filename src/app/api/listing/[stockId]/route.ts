import { NextRequest, NextResponse } from 'next/server'
import { fetchAutoTraderListings, AutoTraderVehicle } from '../../../../utilities/autotrader'
import { mergeVehicleWithPayloadData, fetchPayloadVehicleData, mergeVehiclesWithPayloadData } from '../../../../utilities/mergePayloadData'
import { fetchOverridesMap, applyOverrideToVehicle } from '../../../../utilities/vehicleOverrides'
import { getSoldCarVehicleByStockId } from '@/lib/services/soldCars.service'

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
      
      if (results.length > 0) {
        allListings.push(...results)
        
        // Check if there are more pages
        const total = data.data?.pagination?.totalResults || results.length
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

// Function to get similar vehicles
function getSimilarVehicles(allListings: AutoTraderVehicle[], currentVehicle: AutoTraderVehicle, limit: number = 6): AutoTraderVehicle[] {
  const currentMake = currentVehicle.vehicle.make || currentVehicle.vehicle.standard?.make
  const currentModel = currentVehicle.vehicle.model || currentVehicle.vehicle.standard?.model
  const currentBodyType = currentVehicle.vehicle.bodyType || currentVehicle.vehicle.standard?.bodyType
  const currentPrice = currentVehicle.adverts?.forecourtPrice?.amountGBP || currentVehicle.adverts?.retailAdverts?.totalPrice?.amountGBP || 0
  const currentStockId = currentVehicle.metadata.stockId
  
  if (!currentMake) return []

  // Filter vehicles by same make and exclude current vehicle
  const similarVehicles = allListings.filter(vehicle => {
    const vehicleMake = vehicle.vehicle.make || vehicle.vehicle.standard?.make
    const vehicleStockId = vehicle.metadata.stockId
    
    return vehicleMake?.toLowerCase() === currentMake.toLowerCase() && 
           vehicleStockId !== currentStockId
  })

  // Sort by relevance with multiple priorities
  const sortedVehicles = similarVehicles.sort((a, b) => {
    const aModel = (a.vehicle.model || a.vehicle.standard?.model || '').toLowerCase()
    const bModel = (b.vehicle.model || b.vehicle.standard?.model || '').toLowerCase()
    const aBodyType = (a.vehicle.bodyType || a.vehicle.standard?.bodyType || '').toLowerCase()
    const bBodyType = (b.vehicle.bodyType || b.vehicle.standard?.bodyType || '').toLowerCase()
    const aPrice = a.adverts?.forecourtPrice?.amountGBP || a.adverts?.retailAdverts?.totalPrice?.amountGBP || 0
    const bPrice = b.adverts?.forecourtPrice?.amountGBP || b.adverts?.retailAdverts?.totalPrice?.amountGBP || 0
    
    const currentModelLower = (currentModel || '').toLowerCase()
    const currentBodyTypeLower = (currentBodyType || '').toLowerCase()
    
    // Priority 1: Same model gets highest priority
    const aIsCurrentModel = aModel === currentModelLower
    const bIsCurrentModel = bModel === currentModelLower
    
    if (aIsCurrentModel && !bIsCurrentModel) return -1
    if (!aIsCurrentModel && bIsCurrentModel) return 1
    
    // Priority 2: Same body type (if models are the same priority)
    const aIsCurrentBodyType = aBodyType === currentBodyTypeLower
    const bIsCurrentBodyType = bBodyType === currentBodyTypeLower
    
    if (aIsCurrentBodyType && !bIsCurrentBodyType) return -1
    if (!aIsCurrentBodyType && bIsCurrentBodyType) return 1
    
    // Priority 3: Price proximity (closest price to current vehicle)
    const aPriceDiff = Math.abs(aPrice - currentPrice)
    const bPriceDiff = Math.abs(bPrice - currentPrice)
    
    if (aPriceDiff !== bPriceDiff) {
      return aPriceDiff - bPriceDiff
    }
    
    // Final tie-breaker: newer year first
    const aYear = a.vehicle.yearOfManufacture || 0
    const bYear = b.vehicle.yearOfManufacture || 0
    
    return bYear - aYear
  })

  // Return full vehicle objects, limited to the requested number
  return sortedVehicles.slice(0, limit)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stockId: string }> }
) {
  try {
    const { stockId } = await params
    const { searchParams } = new URL(request.url)

    if (!stockId) {
      return NextResponse.json(
        { error: 'Stock ID is required' },
        { status: 400 }
      )
    }

    // Fetch all listings
    const allListings = await fetchAllListings()

    // Find the specific vehicle by stock ID
    let vehicle = allListings.find(v => v.metadata.stockId === stockId)

    if (!vehicle) {
      // Try to fetch the specific vehicle from Payload as a fallback
      try {
        console.log(`Vehicle ${stockId} not found in cache, trying Payload fallback`)
        const { fetchPayloadVehicleByStockId } = await import('../../../../utilities/payloadFallback')
        const payloadVehicle = await fetchPayloadVehicleByStockId(stockId)
        
        if (payloadVehicle) {
          vehicle = payloadVehicle
          console.log(`Found vehicle ${stockId} in Payload CMS`)
        } else {
          const soldVehicle = await getSoldCarVehicleByStockId(stockId)
          if (soldVehicle) {
            vehicle = soldVehicle
            console.log(`Found sold vehicle ${stockId} in local sold cars DB`)
          } else {
            return NextResponse.json(
              { error: 'Vehicle not found' },
              { status: 404 }
            )
          }
        }
      } catch (payloadError) {
        console.error('Error fetching vehicle from Payload:', payloadError)
        const soldVehicle = await getSoldCarVehicleByStockId(stockId)
        if (soldVehicle) {
          vehicle = soldVehicle
        } else {
          return NextResponse.json(
            { error: 'Vehicle not found' },
            { status: 404 }
          )
        }
      }
    }

    // Get similar vehicles (full objects)
    const similarVehicles = getSimilarVehicles(allListings, vehicle, 6)

    // Efficiently merge both the main vehicle and similar vehicles with Payload data
    const allVehicleStockIds = [stockId, ...similarVehicles.map(v => v.metadata.stockId)]
    const payloadDataMap = await fetchPayloadVehicleData(allVehicleStockIds)
    const overridesMap = await fetchOverridesMap(allVehicleStockIds)

    // Merge the main vehicle with its payload data, then apply DB overrides
    const mergedVehicle = applyOverrideToVehicle(
      mergeVehicleWithPayloadData(vehicle, payloadDataMap.get(stockId)),
      overridesMap.get(stockId),
    )

    // Merge similar vehicles with their payload data (overrides applied inside mergeVehiclesWithPayloadData)
    const mergedSimilarVehicles = await mergeVehiclesWithPayloadData(similarVehicles)

    const response = {
      vehicle: mergedVehicle,
      similarProducts: mergedSimilarVehicles.slice(0, 10),
      totalSimilar: mergedSimilarVehicles.length
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Individual listing API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle details' },
      { status: 500 }
    )
  }
}
