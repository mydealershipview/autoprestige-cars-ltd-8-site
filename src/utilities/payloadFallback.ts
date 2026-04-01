import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { AutoTraderVehicle, AutoTraderListingResponse } from './autotrader'

interface PayloadFetchParams {
  page?: number
  pageSize?: number
  make?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  fuelType?: string
  bodyType?: string
  transmissionType?: string
  minYear?: number
  maxYear?: number
}

/**
 * Fetches vehicles from Payload CMS as a fallback when AutoTrader API is unavailable
 * Provides the same interface as AutoTrader API for seamless fallback
 */
export async function fetchPayloadListings(params: PayloadFetchParams): Promise<AutoTraderListingResponse> {
  const {
    page = 1,
    pageSize = 20,
    make,
    model,
    minPrice,
    maxPrice,
    fuelType,
    bodyType,
    transmissionType,
    minYear,
    maxYear,
  } = params

  try {
    const payload = await getPayload({ config: configPromise })
    
    // Build where clause for filtering
    const whereClause: any = {}

    // Add filters
    if (make) {
      whereClause.or = [
        { 'vehicle.make': { equals: make } },
        { 'vehicle.standard.make': { equals: make } }
      ]
    }

    if (model) {
      const modelConditions = [
        { 'vehicle.model': { equals: model } },
        { 'vehicle.standard.model': { equals: model } }
      ]
      
      if (whereClause.and) {
        whereClause.and.push({ or: modelConditions })
      } else {
        whereClause.and = [{ or: modelConditions }]
      }
    }

    // Price filters
    if (minPrice || maxPrice) {
      const priceConditions: any = {}
      if (minPrice) {
        priceConditions.greater_than_equal = minPrice
      }
      if (maxPrice) {
        priceConditions.less_than_equal = maxPrice
      }

      const priceFilter = {
        or: [
          { 'adverts.retailAdverts.totalPrice.amountGBP': priceConditions },
          { 'adverts.forecourtPrice.amountGBP': priceConditions }
        ]
      }

      if (whereClause.and) {
        whereClause.and.push(priceFilter)
      } else {
        whereClause.and = [priceFilter]
      }
    }

    // Fuel type filter
    if (fuelType) {
      const fuelFilter = {
        or: [
          { 'vehicle.fuelType': { equals: fuelType } },
          { 'vehicle.standard.fuelType': { equals: fuelType } }
        ]
      }

      if (whereClause.and) {
        whereClause.and.push(fuelFilter)
      } else {
        whereClause.and = [fuelFilter]
      }
    }

    // Body type filter
    if (bodyType) {
      const bodyFilter = {
        or: [
          { 'vehicle.bodyType': { equals: bodyType } },
          { 'vehicle.standard.bodyType': { equals: bodyType } }
        ]
      }

      if (whereClause.and) {
        whereClause.and.push(bodyFilter)
      } else {
        whereClause.and = [bodyFilter]
      }
    }

    // Transmission type filter
    if (transmissionType) {
      const transmissionFilter = {
        or: [
          { 'vehicle.transmissionType': { equals: transmissionType } },
          { 'vehicle.standard.transmissionType': { equals: transmissionType } }
        ]
      }

      if (whereClause.and) {
        whereClause.and.push(transmissionFilter)
      } else {
        whereClause.and = [transmissionFilter]
      }
    }

    // Year filters
    if (minYear || maxYear) {
      const yearConditions: any = {}
      if (minYear) {
        yearConditions.greater_than_equal = minYear
      }
      if (maxYear) {
        yearConditions.less_than_equal = maxYear
      }

      const yearFilter = { 'vehicle.yearOfManufacture': yearConditions }

      if (whereClause.and) {
        whereClause.and.push(yearFilter)
      } else {
        whereClause.and = [yearFilter]
      }
    }

    // Fetch vehicles from Payload
    const response = await payload.find({
      collection: 'listings',
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      page,
      limit: pageSize,
      sort: '-updatedAt', // Sort by most recently updated
    })

    // Convert Payload vehicles to AutoTrader format
    const vehicles: AutoTraderVehicle[] = response.docs.map(doc => convertPayloadToAutoTrader(doc))

    return {
      results: vehicles,
      totalResults: response.totalDocs,
      pageSize: response.limit,
      page: response.page
    }
  } catch (error) {
    console.error('Payload fallback fetch error:', error)
    
    // Return empty results if Payload also fails
    return {
      results: [],
      totalResults: 0,
      pageSize,
      page
    }
  }
}

/**
 * Converts a Payload vehicle document to AutoTrader format
 */
function convertPayloadToAutoTrader(doc: any): AutoTraderVehicle {
  // Ensure we have the required structure by providing defaults
  const vehicle: AutoTraderVehicle = {
    vehicle: {
      ownershipCondition: doc.vehicle?.ownershipCondition || 'Used',
      registration: doc.vehicle?.registration || null,
      vin: doc.vehicle?.vin || '',
      make: doc.vehicle?.make || doc.vehicle?.standard?.make || '',
      model: doc.vehicle?.model || doc.vehicle?.standard?.model || '',
      generation: doc.vehicle?.generation || null,
      derivative: doc.vehicle?.derivative || null,
      derivativeId: doc.vehicle?.derivativeId || null,
      vehicleType: doc.vehicle?.vehicleType || 'Car',
      trim: doc.vehicle?.trim || null,
      bodyType: doc.vehicle?.bodyType || doc.vehicle?.standard?.bodyType || null,
      fuelType: doc.vehicle?.fuelType || doc.vehicle?.standard?.fuelType || '',
      transmissionType: doc.vehicle?.transmissionType || doc.vehicle?.standard?.transmissionType || '',
      drivetrain: doc.vehicle?.drivetrain || null,
      seats: doc.vehicle?.seats || null,
      doors: doc.vehicle?.doors || null,
      cylinders: doc.vehicle?.cylinders || null,
      co2EmissionGPKM: doc.vehicle?.co2EmissionGPKM || null,
      topSpeedMPH: doc.vehicle?.topSpeedMPH || null,
      zeroToSixtyMPHSeconds: doc.vehicle?.zeroToSixtyMPHSeconds || null,
      badgeEngineSizeLitres: doc.vehicle?.badgeEngineSizeLitres || null,
      engineCapacityCC: doc.vehicle?.engineCapacityCC || null,
      enginePowerBHP: doc.vehicle?.enginePowerBHP || null,
      fuelCapacityLitres: doc.vehicle?.fuelCapacityLitres || null,
      emissionClass: doc.vehicle?.emissionClass || null,
      owners: doc.vehicle?.owners || null,
      fuelEconomyNEDCCombinedMPG: doc.vehicle?.fuelEconomyNEDCCombinedMPG || null,
      fuelEconomyWLTPCombinedMPG: doc.vehicle?.fuelEconomyWLTPCombinedMPG || null,
      bootSpaceSeatsUpLitres: doc.vehicle?.bootSpaceSeatsUpLitres || null,
      insuranceGroup: doc.vehicle?.insuranceGroup || null,
      firstRegistrationDate: doc.vehicle?.firstRegistrationDate || null,
      colour: doc.vehicle?.colour || doc.vehicle?.standard?.colour || null,
      style: doc.vehicle?.style || doc.vehicle?.standard?.style || null,
      odometerReadingMiles: doc.vehicle?.odometerReadingMiles || null,
      motExpiryDate: doc.vehicle?.motExpiryDate || null,
      warrantyMonthsOnPurchase: doc.vehicle?.warrantyMonthsOnPurchase || null,
      serviceHistory: doc.vehicle?.serviceHistory || null,
      plate: doc.vehicle?.plate || null,
      yearOfManufacture: doc.vehicle?.yearOfManufacture || null,
      standard: {
        make: doc.vehicle?.standard?.make || doc.vehicle?.make || '',
        model: doc.vehicle?.standard?.model || doc.vehicle?.model || '',
        generation: doc.vehicle?.standard?.generation || null,
        derivative: doc.vehicle?.standard?.derivative || null,
        trim: doc.vehicle?.standard?.trim || null,
        bodyType: doc.vehicle?.standard?.bodyType || doc.vehicle?.bodyType || '',
        fuelType: doc.vehicle?.standard?.fuelType || doc.vehicle?.fuelType || '',
        transmissionType: doc.vehicle?.standard?.transmissionType || doc.vehicle?.transmissionType || '',
        colour: doc.vehicle?.standard?.colour || doc.vehicle?.colour || null,
        style: doc.vehicle?.standard?.style || doc.vehicle?.style || null,
      }
    },
    advertiser: {
      advertiserId: doc.advertiser?.advertiserId || process.env.AUTOTRADER_ADVERTISER_ID || '',
      name: doc.advertiser?.name || 'Dealership',
      segment: doc.advertiser?.segment || 'Independent',
      website: doc.advertiser?.website || '',
      phone: doc.advertiser?.phone || '',
      location: {
        addressLineOne: doc.advertiser?.location?.addressLineOne || '',
        town: doc.advertiser?.location?.town || '',
        county: doc.advertiser?.location?.county || null,
        region: doc.advertiser?.location?.region || '',
        postCode: doc.advertiser?.location?.postCode || '',
        latitude: doc.advertiser?.location?.latitude || 0,
        longitude: doc.advertiser?.location?.longitude || 0,
      }
    },
    adverts: {
      forecourtPrice: {
        amountGBP: doc.adverts?.forecourtPrice?.amountGBP || doc.adverts?.retailAdverts?.totalPrice?.amountGBP || null
      },
      soldPrice: {
        amountGBP: doc.adverts?.soldPrice?.amountGBP || null
      },
      forecourtPriceVatStatus: doc.adverts?.forecourtPriceVatStatus || null,
      vatScheme: doc.adverts?.vatScheme || null,
      dueDate: doc.adverts?.dueDate || null,
      manufacturerApproved: doc.adverts?.manufacturerApproved || false,
      twelveMonthsMot: doc.adverts?.twelveMonthsMot || false,
      motInsurance: doc.adverts?.motInsurance || null,
      reservationStatus: doc.adverts?.reservationStatus || null,
      retailAdverts: {
        priceOnApplication: doc.adverts?.retailAdverts?.priceOnApplication || false,
        suppliedPrice: {
          amountGBP: doc.adverts?.retailAdverts?.suppliedPrice?.amountGBP || null,
          amountGBX: doc.adverts?.retailAdverts?.suppliedPrice?.amountGBX || null
        },
        totalPrice: {
          amountGBP: doc.adverts?.retailAdverts?.totalPrice?.amountGBP || null
        },
        reservePrice: doc.adverts?.retailAdverts?.reservePrice || 99,
        adminFee: {
          amountGBP: doc.adverts?.retailAdverts?.adminFee?.amountGBP || null
        },
        adminFeeOverride: {
          amountGBP: doc.adverts?.retailAdverts?.adminFeeOverride?.amountGBP || null
        },
        manufacturerRRP: {
          amountGBP: doc.adverts?.retailAdverts?.manufacturerRRP?.amountGBP || null
        },
        vatStatus: doc.adverts?.retailAdverts?.vatStatus || null,
        attentionGrabber: doc.adverts?.retailAdverts?.attentionGrabber || null,
        description: doc.adverts?.retailAdverts?.description || null,
        description2: doc.adverts?.retailAdverts?.description2 || null,
        priceIndicatorRating: doc.adverts?.retailAdverts?.priceIndicatorRating || 'GOOD',
        priceIndicatorRatingBands: doc.adverts?.retailAdverts?.priceIndicatorRatingBands || null,
        autotraderAdvert: {
          status: doc.adverts?.retailAdverts?.autotraderAdvert?.status || 'PUBLISHED',
          eligibleContractAllowances: doc.adverts?.retailAdverts?.autotraderAdvert?.eligibleContractAllowances || [],
          allocatedContractAllowance: {
            type: doc.adverts?.retailAdverts?.autotraderAdvert?.allocatedContractAllowance?.type || null
          }
        },
        advertiserAdvert: {
          status: doc.adverts?.retailAdverts?.advertiserAdvert?.status || 'PUBLISHED'
        },
        locatorAdvert: {
          status: doc.adverts?.retailAdverts?.locatorAdvert?.status || 'PUBLISHED'
        },
        exportAdvert: {
          status: doc.adverts?.retailAdverts?.exportAdvert?.status || 'PUBLISHED'
        },
        profileAdvert: {
          status: doc.adverts?.retailAdverts?.profileAdvert?.status || 'PUBLISHED'
        },
        displayOptions: {
          excludePreviousOwners: doc.adverts?.retailAdverts?.displayOptions?.excludePreviousOwners || false,
          excludeStrapline: doc.adverts?.retailAdverts?.displayOptions?.excludeStrapline || false,
          excludeMot: doc.adverts?.retailAdverts?.displayOptions?.excludeMot || false,
          excludeWarranty: doc.adverts?.retailAdverts?.displayOptions?.excludeWarranty || false,
          excludeInteriorDetails: doc.adverts?.retailAdverts?.displayOptions?.excludeInteriorDetails || false,
          excludeTyreCondition: doc.adverts?.retailAdverts?.displayOptions?.excludeTyreCondition || false,
          excludeBodyCondition: doc.adverts?.retailAdverts?.displayOptions?.excludeBodyCondition || false,
        },
        financeOffers: doc.adverts?.retailAdverts?.financeOffers || null
      },
      tradeAdverts: {
        dealerAuctionAdvert: {
          status: doc.adverts?.tradeAdverts?.dealerAuctionAdvert?.status || 'NOT_PUBLISHED'
        }
      }
    },
    metadata: {
      stockId: doc.metadata?.stockId || doc.id,
      searchId: doc.metadata?.searchId || `search-${Date.now()}`,
      externalStockId: doc.metadata?.externalStockId || null,
      lastUpdated: doc.metadata?.lastUpdated || doc.updatedAt || new Date().toISOString(),
      versionNumber: doc.metadata?.versionNumber || 1,
      lifecycleState: doc.metadata?.lifecycleState || 'FORECOURT',
      dateOnForecourt: doc.metadata?.dateOnForecourt || doc.createdAt || new Date().toISOString().split('T')[0]
    },
    features: (doc.features || []).map((feature: any) => ({
      name: feature.name || '',
      type: feature.type || 'Standard',
      standardName: feature.standardName || feature.name || '',
      category: feature.category || 'Other',
      rarityRating: feature.rarityRating || 'Common',
      valueRating: feature.valueRating || 'Medium'
    })),
    highlights: (doc.highlights || []).map((highlight: any) => highlight.highlight || ''),
    media: {
      images: (doc.media?.images || []).map((image: any) => ({
        href: image.href || '',
        templated: image.templated || false
      })),
      video: {
        href: doc.media?.video?.href || null
      },
      spin: {
        href: doc.media?.spin?.href || null
      }
    }
  }

  return vehicle
}

/**
 * Fetches a single vehicle by stock ID from Payload
 */
export async function fetchPayloadVehicleByStockId(stockId: string): Promise<AutoTraderVehicle | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    
    const response = await payload.find({
      collection: 'listings',
      where: {
        'metadata.stockId': { equals: stockId }
      },
      limit: 1
    })

    if (response.docs.length === 0) {
      return null
    }

    return convertPayloadToAutoTrader(response.docs[0])
  } catch (error) {
    console.error('Payload single vehicle fetch error:', error)
    return null
  }
}

/**
 * Gets all vehicles from Payload for similar vehicles and makes/models extraction
 */
export async function fetchAllPayloadVehicles(): Promise<AutoTraderVehicle[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    
    const response = await payload.find({
      collection: 'listings',
      limit: 1000, // Get a large number of vehicles
      sort: '-updatedAt'
    })

    return response.docs.map(doc => convertPayloadToAutoTrader(doc))
  } catch (error) {
    console.error('Payload all vehicles fetch error:', error)
    return []
  }
}

/**
 * Gets makes from Payload vehicles (fallback for AutoTrader makes API)
 */
export async function fetchPayloadMakes(): Promise<{ makes: Array<{ makeId: string, name: string }> }> {
  try {
    const vehicles = await fetchAllPayloadVehicles()
    const makesSet = new Set<string>()
    
    vehicles.forEach(vehicle => {
      const make = vehicle.vehicle.make || vehicle.vehicle.standard?.make
      if (make) {
        makesSet.add(make)
      }
    })
    
    const makes = Array.from(makesSet).map((make, index) => ({
      makeId: (index + 1).toString(),
      name: make
    }))
    
    return { makes }
  } catch (error) {
    console.error('Payload makes fetch error:', error)
    return { makes: [] }
  }
}

/**
 * Gets models for a specific make from Payload vehicles (fallback for AutoTrader models API)
 * @param makeId - Can be either makeId (numeric) or make name (string)
 */
export async function fetchPayloadModels(makeId: string): Promise<{ models: Array<{ modelId: string, name: string }> }> {
  try {
    const vehicles = await fetchAllPayloadVehicles()
    const makesMap = new Map<string, string>()
    const modelsSet = new Set<string>()
    
    // First, build a map of make names to IDs
    vehicles.forEach(vehicle => {
      const make = vehicle.vehicle.make || vehicle.vehicle.standard?.make
      if (make) {
        makesMap.set(make, make)
      }
    })
    
    // Convert makeId to make name if it's numeric
    let targetMakeName = makeId
    if (/^\d+$/.test(makeId)) {
      // If it's numeric, try to find the make by index
      const makeNames = Array.from(makesMap.keys())
      const makeIndex = parseInt(makeId) - 1
      if (makeIndex >= 0 && makeIndex < makeNames.length) {
        targetMakeName = makeNames[makeIndex]
      }
    }
    
    // Find models for the target make
    vehicles.forEach(vehicle => {
      const vehicleMake = vehicle.vehicle.make || vehicle.vehicle.standard?.make
      const vehicleModel = vehicle.vehicle.model || vehicle.vehicle.standard?.model
      
      if (vehicleMake?.toLowerCase() === targetMakeName.toLowerCase() && vehicleModel) {
        modelsSet.add(vehicleModel)
      }
    })
    
    const models = Array.from(modelsSet).map((model, index) => ({
      modelId: `${makeId}-${index + 1}`,
      name: model
    }))
    
    return { models }
  } catch (error) {
    console.error('Payload models fetch error:', error)
    return { models: [] }
  }
}