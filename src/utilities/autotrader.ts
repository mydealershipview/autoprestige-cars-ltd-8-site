interface AutoTraderAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface AutoTraderMakesResponse {
  makes: Array<{
    makeId: string
    name: string
  }>
}

interface AutoTraderModelsResponse {
  models: Array<{
    modelId: string
    name: string
  }>
}

interface AutoTraderListingResponse {
  results: AutoTraderVehicle[]
  totalResults: number
  pageSize?: number
  page?: number
}

interface AutoTraderVehicle {
  registration?: string
  forecourtPrice?: {
    amountGBP: number | null
  }
  vehicle: {
    ownershipCondition: string
    registration: string | null
    vin: string
    make: string
    model: string
    generation: string | null
    derivative: string | null
    derivativeId: string | null
    vehicleType: string
    trim: string | null
    bodyType: string | null
    fuelType: string
    transmissionType: string
    drivetrain: string | null
    seats: number | null
    doors: number | null
    cylinders: number | null
    co2EmissionGPKM: number | null
    topSpeedMPH: number | null
    zeroToSixtyMPHSeconds: number | null
    badgeEngineSizeLitres: number | null
    engineCapacityCC: number | null
    enginePowerBHP: number | null
    fuelCapacityLitres: number | null
    emissionClass: string | null
    owners: number | null
    fuelEconomyNEDCCombinedMPG: number | null
    fuelEconomyWLTPCombinedMPG: number | null
    bootSpaceSeatsUpLitres: number | null
    insuranceGroup: string | null
    firstRegistrationDate: string | null
    colour: string | null
    style: string | null
    odometerReadingMiles: number | null
    motExpiryDate: string | null
    warrantyMonthsOnPurchase: number | null
    serviceHistory: string | null
    plate: string | null
    yearOfManufacture: number | null
    standard: {
      make: string
      model: string
      generation: string | null
      derivative: string | null
      trim: string | null
      bodyType: string
      fuelType: string
      transmissionType: string
      colour: string | null
      style: string | null
    }
  }
  advertiser: {
    advertiserId: string
    name: string
    segment: string
    website: string
    phone: string
    location: {
      addressLineOne: string
      town: string
      county: string | null
      region: string
      postCode: string
      latitude: number
      longitude: number
    }
  }
  adverts: {
    forecourtPrice: {
      amountGBP: number | null
    }
    soldPrice?: {
      amountGBP: number | null
    }
    forecourtPriceVatStatus?: string | null
    vatScheme?: string | null
    dueDate?: string | null
    manufacturerApproved?: boolean
    twelveMonthsMot?: boolean
    motInsurance?: string | null
    reservationStatus?: string | null
    retailAdverts: {
      priceOnApplication: boolean
      suppliedPrice: {
        amountGBP: number | null
        amountGBX: number | null
      }
      totalPrice: {
        amountGBP: number | null
      }
      reservePrice?: number | null
      adminFee?: {
        amountGBP: number | null
      }
      adminFeeOverride?: {
        amountGBP: number | null
      }
      manufacturerRRP?: {
        amountGBP: number | null
      }
      vatStatus?: string | null
      attentionGrabber?: string | null
      description: string | null
      description2?: string | null
      priceIndicatorRating: string
      priceIndicatorRatingBands?: any
      autotraderAdvert: {
        status: string
        eligibleContractAllowances?: Array<{
          type: string
        }>
        allocatedContractAllowance?: {
          type: string | null
        }
      }
      advertiserAdvert?: {
        status: string
      }
      locatorAdvert?: {
        status: string
      }
      exportAdvert?: {
        status: string
      }
      profileAdvert?: {
        status: string
      }
      displayOptions?: {
        excludePreviousOwners: boolean
        excludeStrapline: boolean
        excludeMot: boolean
        excludeWarranty: boolean
        excludeInteriorDetails: boolean
        excludeTyreCondition: boolean
        excludeBodyCondition: boolean
      }
      financeOffers?: any
    }
    tradeAdverts?: {
      dealerAuctionAdvert: {
        status: string
      }
    }
  }
  metadata: {
    stockId: string
    searchId: string
    externalStockId: string | null
    lastUpdated: string
    versionNumber: number
    lifecycleState: string
    dateOnForecourt: string
  }
  features: Array<{
    name: string
    type: string
    standardName: string
    category: string
    rarityRating: string
    valueRating: string
  }>
  highlights: string[]
  media: {
    images: Array<{
      href: string
      templated: boolean
    }>
    video: {
      href: string | null
    }
    spin: {
      href: string | null
    }
  }
}

// Cache for storing authentication token
let authToken: string | null = null
let tokenExpiry: number | null = null

const getActiveAffiliateIdsFromEnv = (): string[] => {
  const raw =
    process.env.AUTOTRADER_AFFILIATE_IDS ||
    process.env.AFFILIATE_IDS ||
    process.env.AUTOTRADER_ADVERTISER_ID ||
    process.env.NEXT_PUBLIC_DEALER_AFFILIATE_ID ||
    ''

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

export async function getAutoTraderAuthToken(): Promise<string> {
  // TODO: Check if we have a valid cached token
  if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
    return authToken
  }

  const apiUrl = process.env.AUTOTRADER_API_URL
  const apiKey = process.env.AUTOTRADER_API_KEY
  const apiSecret = process.env.AUTOTRADER_API_SECRET

  if (!apiUrl || !apiKey || !apiSecret) {
    throw new Error('AutoTrader API configuration is missing')
  }

  try {
    const response = await fetch(`https://${apiUrl}/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        // grant_type: 'client_credentials',
        key: apiKey,
        secret: apiSecret,
      }),
    })


    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
    }

    const data: AutoTraderAuthResponse = await response.json()
    
    // Cache the token with expiry time (subtract 5 minutes for safety)
    authToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in * 1000) - (5 * 60 * 1000)
    
    return authToken
  } catch (error) {
    console.error('AutoTrader authentication error:', error)
    throw new Error('Failed to authenticate with AutoTrader API')
  }
}

export async function fetchAllAutoTraderListings(): Promise<AutoTraderVehicle[]> {
  const allListings: AutoTraderVehicle[] = []
  let page = 1
  let hasMoreData = true
  const pageSize = 100 // Fetch larger chunks

  try {
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
        
        // Log progress
        console.log(`Fetched page ${page - 1} of ${totalPages}, total vehicles so far: ${allListings.length}`)
      } else {
        hasMoreData = false
      }
    }

    return allListings
  } catch (error) {
    console.error('Error fetching all AutoTrader listings:', error)
    throw error
  }
}

export async function fetchAutoTraderListings(params: {
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
}): Promise<AutoTraderListingResponse> {
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

  const apiUrl = process.env.AUTOTRADER_API_URL

  if (!apiUrl) {
    throw new Error('AutoTrader API configuration is missing')
  }

  const activeAffiliateIds = getActiveAffiliateIdsFromEnv()

  if (activeAffiliateIds.length === 0) {
    throw new Error('No active affiliate IDs found in environment configuration')
  }

  // Try MyDealershipView API first
  try {
    console.log('Fetching vehicles from MyDealershipView API...')
    const myDealershipUrl = `${process.env.DMS_URL}?dealerEmail=${process.env.DEALER_EMAIL}&pageSize=${pageSize}&page=${page}`
    
    // Add filters to the URL if provided
    const urlParams = new URLSearchParams()
    if (make) urlParams.append('make', make)
    if (model) urlParams.append('model', model)
    if (minPrice) urlParams.append('minPrice', minPrice.toString())
    if (maxPrice) urlParams.append('maxPrice', maxPrice.toString())
    if (fuelType) urlParams.append('fuelType', fuelType)
    if (bodyType) urlParams.append('bodyType', bodyType)
    if (transmissionType) urlParams.append('transmissionType', transmissionType)
    if (minYear) urlParams.append('minYear', minYear.toString())
    if (maxYear) urlParams.append('maxYear', maxYear.toString())
    
    const fullUrl = urlParams.toString() ? `${myDealershipUrl}&${urlParams.toString()}` : myDealershipUrl
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`MyDealershipView API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const vehicles = data.data?.vehicles || []
    const filteredResults = vehicles.filter((vehicle: any) => vehicle.metadata.lifecycleState === 'FORECOURT')
    console.log(`Retrieved ${filteredResults.length} vehicles from MyDealershipView API`)
    
    // Transform response to match AutoTrader format if needed
    return {
      results: filteredResults,
      totalResults: filteredResults.length,
      pageSize: pageSize,
      page: page
    }
  } catch (error) {
    console.error('MyDealershipView API error:', error)
    
    // Fallback to AutoTrader API
    console.log('Falling back to AutoTrader API')
    try {
      const token = await getAutoTraderAuthToken()
      
      // Fetch vehicles for each affiliate ID
      const allResults: AutoTraderVehicle[] = []
      let totalResults = 0
      
      for (const advertiserId of activeAffiliateIds) {
        console.log(`Fetching vehicles for affiliate ID: ${advertiserId}`)
        
        // Build query parameters
        const queryParams = new URLSearchParams({
          advertiserId,
          page: page.toString(),
          pageSize: pageSize.toString(),
        })

        // Add optional filters
        if (make) queryParams.append('make', make)
        if (model) queryParams.append('model', model)
        if (minPrice) queryParams.append('priceFrom', minPrice.toString())
        if (maxPrice) queryParams.append('priceTo', maxPrice.toString())
        if (fuelType) queryParams.append('fuelType', fuelType)
        if (bodyType) queryParams.append('bodyType', bodyType)
        if (transmissionType) queryParams.append('transmissionType', transmissionType)
        if (minYear) queryParams.append('yearFrom', minYear.toString())
        if (maxYear) queryParams.append('yearTo', maxYear.toString())

        const url = `https://${apiUrl}/stock?${queryParams}`

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Failed to fetch listings for affiliate ${advertiserId}: ${response.status} ${response.statusText} - ${errorText}`)
          continue // Skip this affiliate and try the next one
        }

        const data: AutoTraderListingResponse = await response.json()
        
        if (data.results && data.results.length > 0) {
          const filteredResults = data.results.filter(vehicle => vehicle.metadata.lifecycleState === 'FORECOURT')
          allResults.push(...filteredResults)
          totalResults += filteredResults?.length || 0
          console.log(`Retrieved ${filteredResults?.length} vehicles from affiliate ${advertiserId}`)
        }
      }

      // Ensure we have the expected structure
      const formattedData: AutoTraderListingResponse = {
        results: allResults,
        totalResults: totalResults,
        pageSize: pageSize,
        page: page
      }
      
      console.log(`Fallback: Retrieved ${totalResults} vehicles from AutoTrader API`)
      return formattedData
    } catch (error) {
      console.error('AutoTrader API fallback also failed:', error)
      authToken = null
      tokenExpiry = null
      
      // Final fallback to dummy data
      console.log('Using final fallback dummy data')
      const dummyListings = await getDummyListings(params)
      
      // Try to merge with payload data for dummy listings too
      try {
        const { mergeVehiclesWithPayloadData } = await import('./mergePayloadData')
        const mergedDummyVehicles = await mergeVehiclesWithPayloadData(dummyListings.results)
        return {
          ...dummyListings,
          results: mergedDummyVehicles
        }
      } catch (mergeError) {
        console.error('Error merging dummy data with payload:', mergeError)
        return dummyListings
      }
    }
  }
}

// Fallback function that returns dummy data
async function getDummyListings(params: {
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
}): Promise<AutoTraderListingResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const { page = 1, pageSize = 20 } = params

  const dummyVehicles: AutoTraderVehicle[] = Array.from({ length: pageSize }, (_, index) => ({
    vehicle: {
      ownershipCondition: "Used",
      registration: `AB${12 + index} CDE`,
      vin: `WVWZZZ3CZDE${String(123456 + index).padStart(6, '0')}`,
      make: index % 4 === 0 ? "BMW" : index % 4 === 1 ? "Mercedes-Benz" : index % 4 === 2 ? "Audi" : "Volkswagen",
      model: index % 4 === 0 ? "X5" : index % 4 === 1 ? "C-Class" : index % 4 === 2 ? "A4" : "Golf",
      generation: null,
      derivative: null,
      derivativeId: null,
      vehicleType: "Car",
      trim: null,
      bodyType: index % 3 === 0 ? "SUV" : index % 3 === 1 ? "Saloon" : "Hatchback",
      fuelType: index % 3 === 0 ? "Petrol" : index % 3 === 1 ? "Diesel" : "Electric",
      transmissionType: index % 2 === 0 ? "Automatic" : "Manual",
      drivetrain: "Front Wheel Drive",
      seats: 5,
      doors: index % 2 === 0 ? 5 : 4,
      cylinders: 4,
      co2EmissionGPKM: 120 + (index * 10),
      topSpeedMPH: 120 + (index * 5),
      zeroToSixtyMPHSeconds: 8.5 + (index * 0.2),
      badgeEngineSizeLitres: 2.0,
      engineCapacityCC: 2000,
      enginePowerBHP: 150 + (index * 10),
      fuelCapacityLitres: 60,
      emissionClass: "Euro 6",
      owners: 1 + (index % 3),
      fuelEconomyNEDCCombinedMPG: 35 + (index * 2),
      fuelEconomyWLTPCombinedMPG: 32 + (index * 2),
      bootSpaceSeatsUpLitres: 400 + (index * 50),
      insuranceGroup: `${15 + (index % 10)}E`,
      firstRegistrationDate: `202${1 + (index % 3)}-0${1 + (index % 9)}-15`,
      colour: index % 5 === 0 ? "Black" : index % 5 === 1 ? "White" : index % 5 === 2 ? "Silver" : index % 5 === 3 ? "Blue" : "Red",
      style: null,
      odometerReadingMiles: 15000 + (index * 5000),
      motExpiryDate: "2025-12-31",
      warrantyMonthsOnPurchase: 12,
      serviceHistory: "Full Service History",
      plate: `AB${12 + index} CDE`,
      yearOfManufacture: 2020 + (index % 4),
      standard: {
        make: index % 4 === 0 ? "BMW" : index % 4 === 1 ? "Mercedes-Benz" : index % 4 === 2 ? "Audi" : "Volkswagen",
        model: index % 4 === 0 ? "X5" : index % 4 === 1 ? "C-Class" : index % 4 === 2 ? "A4" : "Golf",
        generation: null,
        derivative: null,
        trim: null,
        bodyType: index % 3 === 0 ? "SUV" : index % 3 === 1 ? "Saloon" : "Hatchback",
        fuelType: index % 3 === 0 ? "Petrol" : index % 3 === 1 ? "Diesel" : "Electric",
        transmissionType: index % 2 === 0 ? "Automatic" : "Manual",
        colour: index % 5 === 0 ? "Black" : index % 5 === 1 ? "White" : index % 5 === 2 ? "Silver" : index % 5 === 3 ? "Blue" : "Red",
        style: null,
      }
    },
    advertiser: {
      advertiserId: "10028737",
      name: "Premium Cars Ltd",
      segment: "Independent",
      website: "http://www.premiumcars.co.uk",
      phone: "(0161) 4960000",
      location: {
        addressLineOne: "First Street",
        town: "MANCHESTER",
        county: null,
        region: "NORTH WEST",
        postCode: "M15 4FN",
        latitude: 53.4721936,
        longitude: -2.24703
      }
    },
    adverts: {
      forecourtPrice: {
        amountGBP: 15000 + (index * 2000)
      },
      manufacturerApproved: false,
      twelveMonthsMot: true,
      retailAdverts: {
        priceOnApplication: false,
        suppliedPrice: {
          amountGBP: 15000 + (index * 2000),
          amountGBX: (15000 + (index * 2000)) * 100
        },
        totalPrice: {
          amountGBP: 15000 + (index * 2000)
        },
        description: `Beautiful ${index % 4 === 0 ? "BMW" : index % 4 === 1 ? "Mercedes-Benz" : index % 4 === 2 ? "Audi" : "Volkswagen"} in excellent condition. Full service history, low mileage, and ready to drive away today.`,
        priceIndicatorRating: "GOOD",
        autotraderAdvert: {
          status: "PUBLISHED"
        }
      }
    },
    metadata: {
      stockId: `stock-${String(1000 + index).padStart(6, '0')}`,
      searchId: `search-${Date.now()}-${index}`,
      externalStockId: null,
      lastUpdated: new Date().toISOString(),
      versionNumber: 1,
      lifecycleState: "FORECOURT",
      dateOnForecourt: new Date().toISOString().split('T')[0]
    },
    features: [
      {
        name: "Air Conditioning",
        type: "Standard",
        standardName: "Air Conditioning",
        category: "Comfort",
        rarityRating: "Common",
        valueRating: "Medium"
      },
      {
        name: "Alloy Wheels",
        type: "Standard",
        standardName: "Alloy Wheels", 
        category: "Exterior",
        rarityRating: "Common",
        valueRating: "Medium"
      },
      {
        name: "Bluetooth",
        type: "Standard",
        standardName: "Bluetooth Connectivity",
        category: "Technology",
        rarityRating: "Common",
        valueRating: "High"
      }
    ],
    highlights: ["Low Mileage", "Full Service History", "One Owner"],
    media: {
      images: [
        {
          href: `/api/placeholder-car-${index % 10 + 1}.jpg`,
          templated: false
        }
      ],
      video: {
        href: null
      },
      spin: {
        href: null
      }
    }
  }))

  return {
    results: dummyVehicles,
    totalResults: 150, // Simulate total results
    pageSize,
    page
  }
}

// export async function fetchAutoTraderMakes(): Promise<AutoTraderMakesResponse> {
//   const apiUrl = process.env.AUTOTRADER_API_URL
//   const advertiserId = process.env.AUTOTRADER_ADVERTISER_ID

//   if (!apiUrl || !advertiserId) {
//     throw new Error('AutoTrader API configuration is missing')
//   }

//   try {
//     const token = await getAutoTraderAuthToken()
    
//     const queryParams = new URLSearchParams({
//       vehicleType: 'Car',
//       advertiserId,
//     })

//     const url = `https://${apiUrl}/taxonomy/makes?${queryParams}`

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     })

//     if (!response.ok) {
//       const errorText = await response.text()
//       throw new Error(`Failed to fetch makes: ${response.status} ${response.statusText} - ${errorText}`)
//     }

//     const data: AutoTraderMakesResponse = await response.json()
    
//     return data
//   } catch (error) {
//     console.error('AutoTrader makes fetch error:', error)
//     authToken = null
//     tokenExpiry = null
    
//     // Fallback to dummy data if API is not available
//     console.log('Using fallback dummy makes data due to API error')
//     return getDummyMakes()
//   }
// }

// export async function fetchAutoTraderModels(makeId: string): Promise<AutoTraderModelsResponse> {
//   const apiUrl = process.env.AUTOTRADER_API_URL
//   const advertiserId = process.env.AUTOTRADER_ADVERTISER_ID

//   if (!apiUrl || !advertiserId) {
//     throw new Error('AutoTrader API configuration is missing')
//   }

//   try {
//     const token = await getAutoTraderAuthToken()
    
//     const queryParams = new URLSearchParams({
//       makeId,
//       vehicleType: 'Car',
//       advertiserId,
//     })

//     const url = `https://${apiUrl}/taxonomy/models?${queryParams}`

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     })

//     if (!response.ok) {
//       const errorText = await response.text()
//       throw new Error(`Failed to fetch models: ${response.status} ${response.statusText} - ${errorText}`)
//     }

//     const data: AutoTraderModelsResponse = await response.json()
    
//     return data
//   } catch (error) {
//     console.error('AutoTrader models fetch error:', error)
//     authToken = null
//     tokenExpiry = null
    
//     // Fallback to dummy data if API is not available
//     console.log('Using fallback dummy models data due to API error')
//     return getDummyModels(makeId)
//   }
// }

// Fallback function for makes

// async function getDummyMakes(): Promise<AutoTraderMakesResponse> {
//   // Simulate API delay
//   await new Promise(resolve => setTimeout(resolve, 500))

//   return {
//     makes: [
//       { makeId: '1', name: 'Audi' },
//       { makeId: '2', name: 'BMW' },
//       { makeId: '3', name: 'Mercedes-Benz' },
//       { makeId: '4', name: 'Volkswagen' },
//       { makeId: '5', name: 'Ford' },
//       { makeId: '6', name: 'Toyota' },
//       { makeId: '7', name: 'Honda' },
//       { makeId: '8', name: 'Nissan' },
//     ]
//   }
// }

// Fallback function for models
// async function getDummyModels(makeId: string): Promise<AutoTraderModelsResponse> {
//   // Simulate API delay
//   await new Promise(resolve => setTimeout(resolve, 500))

//   const modelsMap: Record<string, Array<{modelId: string, name: string}>> = {
//     '1': [ // Audi
//       { modelId: '1-1', name: 'A3' },
//       { modelId: '1-2', name: 'A4' },
//       { modelId: '1-3', name: 'A6' },
//       { modelId: '1-4', name: 'Q3' },
//       { modelId: '1-5', name: 'Q5' },
//     ],
//     '2': [ // BMW
//       { modelId: '2-1', name: '1 Series' },
//       { modelId: '2-2', name: '3 Series' },
//       { modelId: '2-3', name: '5 Series' },
//       { modelId: '2-4', name: 'X3' },
//       { modelId: '2-5', name: 'X5' },
//     ],
//     '3': [ // Mercedes-Benz
//       { modelId: '3-1', name: 'A-Class' },
//       { modelId: '3-2', name: 'C-Class' },
//       { modelId: '3-3', name: 'E-Class' },
//       { modelId: '3-4', name: 'GLA' },
//       { modelId: '3-5', name: 'GLC' },
//     ],
//     '4': [ // Volkswagen
//       { modelId: '4-1', name: 'Golf' },
//       { modelId: '4-2', name: 'Polo' },
//       { modelId: '4-3', name: 'Passat' },
//       { modelId: '4-4', name: 'Tiguan' },
//       { modelId: '4-5', name: 'Touareg' },
//     ],
//     '5': [ // Ford
//       { modelId: '5-1', name: 'Fiesta' },
//       { modelId: '5-2', name: 'Focus' },
//       { modelId: '5-3', name: 'Mondeo' },
//       { modelId: '5-4', name: 'Kuga' },
//       { modelId: '5-5', name: 'Mustang' },
//     ],
//     '6': [ // Toyota
//       { modelId: '6-1', name: 'Corolla' },
//       { modelId: '6-2', name: 'Camry' },
//       { modelId: '6-3', name: 'RAV4' },
//       { modelId: '6-4', name: 'Prius' },
//       { modelId: '6-5', name: 'Yaris' },
//     ],
//     '7': [ // Honda
//       { modelId: '7-1', name: 'Civic' },
//       { modelId: '7-2', name: 'Accord' },
//       { modelId: '7-3', name: 'CR-V' },
//       { modelId: '7-4', name: 'Jazz' },
//       { modelId: '7-5', name: 'HR-V' },
//     ],
//     '8': [ // Nissan
//       { modelId: '8-1', name: 'Micra' },
//       { modelId: '8-2', name: 'Qashqai' },
//       { modelId: '8-3', name: 'X-Trail' },
//       { modelId: '8-4', name: 'Juke' },
//       { modelId: '8-5', name: 'Leaf' },
//     ],
//   }

//   return {
//     models: modelsMap[makeId] || []
//   }
// }

export type { AutoTraderVehicle, AutoTraderListingResponse, AutoTraderMakesResponse, AutoTraderModelsResponse }
