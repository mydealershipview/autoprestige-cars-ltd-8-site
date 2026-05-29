import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { AutoTraderVehicle } from './autotrader'
import { applyVehicleOverrides } from './vehicleOverrides'

interface PayloadVehicleData {
  id?: string
  metadata?: {
    stockId?: string
  }
  adverts?: {
    retailAdverts?: {
      totalPrice?: {
        amountGBP?: number
      }
      description?: string
      description2?: string
      reservePrice?: number
    }
    forecourtPrice?: {
      amountGBP?: number
    }
  }
}

/**
 * Efficiently fetches all Payload vehicle data for given stock IDs
 * Uses a single database query to fetch all vehicles at once
 */
export async function fetchPayloadVehicleData(stockIds: string[]): Promise<Map<string, PayloadVehicleData>> {
  if (stockIds.length === 0) return new Map()

  try {
    const payload = await getPayload({ config: configPromise })
    
    // Fetch all payload vehicles in a single query using the 'in' operator
    const payloadResponse = await payload.find({
      collection: 'listings',
      where: {
        'metadata.stockId': {
          in: stockIds,
        }
      },
      // Only select the fields we need for merging to reduce data transfer
      select: {
        metadata: {
          stockId: true,
        },
        adverts: {
          retailAdverts: {
            totalPrice: {
              amountGBP: true,
            },
            description: true,
            description2: true,
            reservePrice: true,
          },
          forecourtPrice: {
            amountGBP: true,
          },
        },
      },
      limit: stockIds.length, // Set limit to the number of stock IDs we're looking for
    })

    // Create a Map for O(1) lookup performance
    const payloadDataMap = new Map<string, PayloadVehicleData>()
    
    for (const vehicle of payloadResponse.docs) {
      if (vehicle.metadata?.stockId) {
        payloadDataMap.set(vehicle.metadata.stockId, vehicle as PayloadVehicleData)
      }
    }

    return payloadDataMap
  } catch (error) {
    console.error('Error fetching payload vehicle data:', error)
    return new Map()
  }
}

/**
 * Merges a single AutoTrader vehicle with its corresponding Payload data
 */
export function mergeVehicleWithPayloadData(
  vehicle: AutoTraderVehicle, 
  payloadData?: PayloadVehicleData
): AutoTraderVehicle {
  if (!payloadData) return vehicle

  // Create a deep copy to avoid mutating the original vehicle
  const mergedVehicle = JSON.parse(JSON.stringify(vehicle)) as AutoTraderVehicle

  // Merge price data - payload takes precedence
  if (payloadData.adverts?.retailAdverts?.totalPrice?.amountGBP !== undefined) {
    mergedVehicle.adverts.retailAdverts.totalPrice.amountGBP = payloadData.adverts.retailAdverts.totalPrice.amountGBP
    mergedVehicle.adverts.forecourtPrice.amountGBP = payloadData.adverts.retailAdverts.totalPrice.amountGBP
  }

  // Merge descriptions - payload takes precedence if not empty
  if (payloadData.adverts?.retailAdverts?.description) {
    mergedVehicle.adverts.retailAdverts.description = payloadData.adverts.retailAdverts.description
  }

  if (payloadData.adverts?.retailAdverts?.description2) {
    mergedVehicle.adverts.retailAdverts.description2 = payloadData.adverts.retailAdverts.description2
  }

  // Merge reserve price - payload takes precedence
  if (payloadData.adverts?.retailAdverts?.reservePrice !== undefined) {
    // @ts-ignore - Adding reservePrice which exists in payload but not in AutoTrader type
    mergedVehicle.adverts.retailAdverts.reservePrice = payloadData.adverts.retailAdverts.reservePrice
  } else {
    // Set default reserve price if not set in payload
    // @ts-ignore
    mergedVehicle.adverts.retailAdverts.reservePrice = 99
  }

  return mergedVehicle
}

/**
 * Efficiently merges multiple AutoTrader vehicles with their Payload data
 * Fetches all Payload data in a single query and merges in memory
 */
export async function mergeVehiclesWithPayloadData(vehicles: AutoTraderVehicle[]): Promise<AutoTraderVehicle[]> {
  // Defensive check: ensure vehicles is an array
  if (!Array.isArray(vehicles)) {
    console.error('mergeVehiclesWithPayloadData: vehicles parameter is not an array', typeof vehicles)
    return []
  }
  
  if (vehicles.length === 0) return vehicles

  // Extract all stock IDs with null safety
  const stockIds = vehicles
    .map(vehicle => vehicle?.metadata?.stockId)
    .filter(Boolean) // Remove any undefined/null stock IDs

  // Fetch all payload data in a single query
  const payloadDataMap = await fetchPayloadVehicleData(stockIds)

  // Merge each vehicle with its corresponding payload data
  const payloadMerged = vehicles.map(vehicle => {
    const payloadData = payloadDataMap.get(vehicle.metadata.stockId)
    return mergeVehicleWithPayloadData(vehicle, payloadData)
  })

  // Apply local DB overrides (attentionGrabber, listingPrice) — these take final precedence
  const mergedVehicles = await applyVehicleOverrides(payloadMerged)

  return mergedVehicles
}

/**
 * Type guard to check if a vehicle has payload customizations
 */
export function hasPayloadCustomizations(vehicle: AutoTraderVehicle, payloadData?: PayloadVehicleData): boolean {
  if (!payloadData) return false

  return !!(
    payloadData.adverts?.retailAdverts?.totalPrice?.amountGBP ||
    payloadData.adverts?.retailAdverts?.description ||
    payloadData.adverts?.retailAdverts?.description2 ||
    payloadData.adverts?.retailAdverts?.reservePrice
  )
}