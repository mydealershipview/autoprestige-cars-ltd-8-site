import { getDmsWebsiteVehicles } from '@/lib/services/dmsWebsiteStock'
import { AutoTraderVehicle } from '@/utilities/autotrader'
import { mergeVehicleWithPayloadData, fetchPayloadVehicleData, mergeVehiclesWithPayloadData, preferDmsAdvertCopy } from '@/utilities/mergePayloadData'
import { fetchOverridesMap, applyOverrideToVehicle } from '@/utilities/vehicleOverrides'
import { getSoldCarVehicleByStockId } from '@/lib/services/soldCars.service'

async function fetchAllListings(): Promise<AutoTraderVehicle[]> {
  return getDmsWebsiteVehicles('live')
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

export async function getVehicleDetails(stockId: string) {
    // Fetch all listings
    const allListings = await fetchAllListings()

    // Find the specific vehicle by stock ID
    let vehicle = allListings.find(v => v.metadata.stockId === stockId)

    if (!vehicle) vehicle = (await getSoldCarVehicleByStockId(stockId)) ?? undefined
    if (!vehicle) return null

    // Get similar vehicles (full objects)
    const similarVehicles = getSimilarVehicles(allListings, vehicle, 6)

    // The DMS owns sold adverts, including price, text and visibility.
    const sold = vehicle.metadata.lifecycleState === 'SOLD'
    const allVehicleStockIds = [stockId, ...similarVehicles.map(v => v.metadata.stockId)]
    const payloadDataMap = sold ? new Map() : await fetchPayloadVehicleData(allVehicleStockIds)
    const overridesMap = sold ? new Map() : await fetchOverridesMap(allVehicleStockIds)
    const mergedVehicle = sold ? vehicle : preferDmsAdvertCopy(vehicle, applyOverrideToVehicle(
      mergeVehicleWithPayloadData(vehicle, payloadDataMap.get(stockId)), overridesMap.get(stockId),
    ))
    const mergedSimilarVehicles = await mergeVehiclesWithPayloadData(similarVehicles)

    const response = {
      vehicle: mergedVehicle,
      similarProducts: mergedSimilarVehicles.slice(0, 10),
      totalSimilar: mergedSimilarVehicles.length
    }

    return response
}
