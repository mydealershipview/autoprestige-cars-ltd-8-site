import type { PipelineStage } from 'mongoose'
import connectDB from '@/lib/db/connect'
import SoldCarModel, { type ISoldCar } from '@/lib/db/models/soldCar.model'
import { fetchAutoTraderListings, type AutoTraderVehicle } from '@/utilities/autotrader'
import { normalizeDmsVehicles } from '@/utilities/dmsVehicle'

const DMS_CACHE_DURATION = 5 * 60 * 1000
const RECENT_SOLD_DAYS = 30

let dmsSoldCache: AutoTraderVehicle[] | null = null
let dmsSoldCacheTimestamp: number | null = null
let soldRefreshPromise: Promise<void> | null = null
let soldRefreshTimestamp: number | null = null

type LeanSoldCar = ISoldCar & { _id: unknown }

export type SoldCarAdminRecord = {
  id: string
  stockId: string
  registration: string | null
  make: string | null
  model: string | null
  derivative: string | null
  soldDate: string
  firstSeenAt: string
  showAfter30Days: boolean
  vehicle: AutoTraderVehicle
  createdAt?: string
  updatedAt?: string
}

function toIso(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return undefined
}

function readDate(value: unknown): Date | null {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

function getNestedValue(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, source)
}

function extractDmsSoldDate(vehicle: AutoTraderVehicle): Date | null {
  const possiblePaths = [
    'metadata.soldDate',
    'metadata.dateSold',
    'metadata.soldOn',
    'metadata.soldAt',
    'adverts.soldDate',
    'adverts.dateSold',
  ]

  for (const path of possiblePaths) {
    const date = readDate(getNestedValue(vehicle, path))
    if (date) return date
  }

  return null
}

function serializeSoldCar(doc: LeanSoldCar): SoldCarAdminRecord {
  return {
    id: String(doc._id),
    stockId: doc.stockId,
    registration: doc.registration ?? null,
    make: doc.make ?? null,
    model: doc.model ?? null,
    derivative: doc.derivative ?? null,
    soldDate: toIso(doc.soldDate) || new Date().toISOString(),
    firstSeenAt: toIso(doc.firstSeenAt) || new Date().toISOString(),
    showAfter30Days: Boolean(doc.showAfter30Days),
    vehicle: doc.vehicle,
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  }
}

function compactSoldVehicleSnapshot(vehicle: AutoTraderVehicle, soldDate: Date): AutoTraderVehicle {
  const standard = vehicle.vehicle?.standard || {}
  const price =
    vehicle.adverts?.forecourtPrice?.amountGBP ??
    vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP ??
    null

  return {
    registration: vehicle.registration,
    forecourtPrice: { amountGBP: price },
    vehicle: {
      ownershipCondition: vehicle.vehicle?.ownershipCondition || '',
      registration: vehicle.vehicle?.registration || null,
      vin: vehicle.vehicle?.vin || '',
      make: vehicle.vehicle?.make || standard.make || '',
      model: vehicle.vehicle?.model || standard.model || '',
      generation: vehicle.vehicle?.generation || standard.generation || null,
      derivative: vehicle.vehicle?.derivative || standard.derivative || null,
      derivativeId: vehicle.vehicle?.derivativeId || null,
      vehicleType: vehicle.vehicle?.vehicleType || '',
      trim: vehicle.vehicle?.trim || standard.trim || null,
      bodyType: vehicle.vehicle?.bodyType || standard.bodyType || null,
      fuelType: vehicle.vehicle?.fuelType || standard.fuelType || '',
      transmissionType: vehicle.vehicle?.transmissionType || standard.transmissionType || '',
      drivetrain: vehicle.vehicle?.drivetrain || null,
      seats: vehicle.vehicle?.seats || null,
      doors: vehicle.vehicle?.doors || null,
      cylinders: vehicle.vehicle?.cylinders || null,
      co2EmissionGPKM: vehicle.vehicle?.co2EmissionGPKM || null,
      topSpeedMPH: vehicle.vehicle?.topSpeedMPH || null,
      zeroToSixtyMPHSeconds: vehicle.vehicle?.zeroToSixtyMPHSeconds || null,
      badgeEngineSizeLitres: vehicle.vehicle?.badgeEngineSizeLitres || null,
      engineCapacityCC: vehicle.vehicle?.engineCapacityCC || null,
      enginePowerBHP: vehicle.vehicle?.enginePowerBHP || null,
      fuelCapacityLitres: vehicle.vehicle?.fuelCapacityLitres || null,
      emissionClass: vehicle.vehicle?.emissionClass || null,
      owners: vehicle.vehicle?.owners || null,
      fuelEconomyNEDCCombinedMPG: vehicle.vehicle?.fuelEconomyNEDCCombinedMPG || null,
      fuelEconomyWLTPCombinedMPG: vehicle.vehicle?.fuelEconomyWLTPCombinedMPG || null,
      bootSpaceSeatsUpLitres: vehicle.vehicle?.bootSpaceSeatsUpLitres || null,
      insuranceGroup: vehicle.vehicle?.insuranceGroup || null,
      firstRegistrationDate: vehicle.vehicle?.firstRegistrationDate || null,
      colour: vehicle.vehicle?.colour || standard.colour || null,
      style: vehicle.vehicle?.style || standard.style || null,
      odometerReadingMiles: vehicle.vehicle?.odometerReadingMiles || null,
      motExpiryDate: vehicle.vehicle?.motExpiryDate || null,
      warrantyMonthsOnPurchase: vehicle.vehicle?.warrantyMonthsOnPurchase || null,
      serviceHistory: vehicle.vehicle?.serviceHistory || null,
      plate: vehicle.vehicle?.plate || null,
      yearOfManufacture: vehicle.vehicle?.yearOfManufacture || null,
      standard: {
        make: standard.make || vehicle.vehicle?.make || '',
        model: standard.model || vehicle.vehicle?.model || '',
        generation: standard.generation || vehicle.vehicle?.generation || null,
        derivative: standard.derivative || vehicle.vehicle?.derivative || null,
        trim: standard.trim || vehicle.vehicle?.trim || null,
        bodyType: standard.bodyType || vehicle.vehicle?.bodyType || '',
        fuelType: standard.fuelType || vehicle.vehicle?.fuelType || '',
        transmissionType: standard.transmissionType || vehicle.vehicle?.transmissionType || '',
        colour: standard.colour || vehicle.vehicle?.colour || null,
        style: standard.style || vehicle.vehicle?.style || null,
      },
    },
    advertiser: vehicle.advertiser,
    adverts: {
      forecourtPrice: { amountGBP: price },
      soldPrice: vehicle.adverts?.soldPrice,
      retailAdverts: {
        priceOnApplication: vehicle.adverts?.retailAdverts?.priceOnApplication || false,
        suppliedPrice: {
          amountGBP: vehicle.adverts?.retailAdverts?.suppliedPrice?.amountGBP || price,
          amountGBX: vehicle.adverts?.retailAdverts?.suppliedPrice?.amountGBX || null,
        },
        totalPrice: { amountGBP: price },
        attentionGrabber: vehicle.adverts?.retailAdverts?.attentionGrabber || null,
        reservationStatus: vehicle.adverts?.retailAdverts?.reservationStatus || null,
        description: vehicle.adverts?.retailAdverts?.description || null,
        description2: vehicle.adverts?.retailAdverts?.description2 || null,
        priceIndicatorRating: vehicle.adverts?.retailAdverts?.priceIndicatorRating || '',
        autotraderAdvert: {
          status: vehicle.adverts?.retailAdverts?.autotraderAdvert?.status || '',
        },
      },
    },
    metadata: {
      stockId: vehicle.metadata?.stockId || '',
      searchId: vehicle.metadata?.searchId || '',
      externalStockId: vehicle.metadata?.externalStockId || null,
      lastUpdated: vehicle.metadata?.lastUpdated || new Date().toISOString(),
      versionNumber: vehicle.metadata?.versionNumber || 0,
      lifecycleState: 'SOLD',
      dateOnForecourt: soldDate.toISOString(),
    },
    features: vehicle.features || [],
    highlights: vehicle.highlights || [],
    media: {
      images: vehicle.media?.images || [],
      video: { href: vehicle.media?.video?.href || null },
      spin: { href: vehicle.media?.spin?.href || null },
    },
  }
}

export async function fetchSoldVehiclesFromDMS(): Promise<AutoTraderVehicle[]> {
  if (dmsSoldCache && dmsSoldCacheTimestamp && Date.now() - dmsSoldCacheTimestamp < DMS_CACHE_DURATION) {
    return dmsSoldCache
  }

  const pageSize = 100
  let soldListings: AutoTraderVehicle[] = []

  try {
    let currentPage = 1
    let hasMoreData = true

    while (hasMoreData) {
      const myDealershipUrl = `${process.env.DMS_URL}?dealerEmail=${process.env.DEALER_EMAIL}&pageSize=${pageSize}&page=${currentPage}`
      const response = await fetch(myDealershipUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`MyDealershipView API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const results = normalizeDmsVehicles(data.data?.vehicles)

      if (results.length > 0) {
        soldListings.push(
          ...results.filter((vehicle: AutoTraderVehicle) => vehicle.metadata?.lifecycleState === 'SOLD'),
        )

        const total = Number(data.data?.pagination?.totalResults) || results.length
        const totalPages = Math.ceil(total / pageSize)
        hasMoreData = currentPage < totalPages
        currentPage += 1
      } else {
        hasMoreData = false
      }
    }
    

    soldListings = soldListings.filter(vehicle => vehicle.registration !== 'YJ16XAO')
    dmsSoldCache = soldListings
    dmsSoldCacheTimestamp = Date.now()
    return soldListings
  } catch (error) {
    console.error('[soldCars.service] MyDealershipView sold sync failed:', error)
  }

  try {
    let page = 1
    let hasMoreData = true

    while (hasMoreData) {
      const response = await fetchAutoTraderListings({ page, pageSize })
      if (response.results && response.results.length > 0) {
        soldListings.push(
          ...response.results.filter((vehicle) => vehicle.metadata?.lifecycleState === 'SOLD'),
        )
        const totalPages = Math.ceil(response.totalResults / pageSize)
        hasMoreData = page < totalPages
        page += 1
      } else {
        hasMoreData = false
      }
    }

    dmsSoldCache = soldListings
    dmsSoldCacheTimestamp = Date.now()
    return soldListings
  } catch (error) {
    console.error('[soldCars.service] AutoTrader sold fallback failed:', error)
    return dmsSoldCache || []
  }
}

export async function syncSoldCarsFromDMS(): Promise<{ synced: number; insertedOrUpdated: number }> {
  const soldVehicles = await fetchSoldVehiclesFromDMS()
  if (soldVehicles.length === 0) {
    return { synced: 0, insertedOrUpdated: 0 }
  }

  await connectDB()
  const now = new Date()
  const operations = soldVehicles
    .filter((vehicle) => vehicle.metadata?.stockId)
    .map((vehicle) => {
      const stockId = vehicle.metadata.stockId
      const dmsSoldDate = extractDmsSoldDate(vehicle)
      const soldDate = dmsSoldDate || now
      const make = vehicle.vehicle?.make || vehicle.vehicle?.standard?.make || null
      const model = vehicle.vehicle?.model || vehicle.vehicle?.standard?.model || null
      const derivative = vehicle.vehicle?.derivative || vehicle.vehicle?.standard?.derivative || null
      const registration = vehicle.vehicle?.registration || null
      const snapshot = compactSoldVehicleSnapshot(vehicle, soldDate)
      const setFields = {
        registration,
        make,
        model,
        derivative,
        vehicle: snapshot,
        ...(dmsSoldDate ? { soldDate: dmsSoldDate } : {}),
      }
      const setOnInsertFields = {
        ...(!dmsSoldDate ? { soldDate } : {}),
        firstSeenAt: now,
        showAfter30Days: false,
      }

      return {
        updateOne: {
          filter: { stockId },
          update: {
            $set: setFields,
            $setOnInsert: setOnInsertFields,
          },
          upsert: true,
        },
      }
    })

  if (operations.length === 0) {
    return { synced: soldVehicles.length, insertedOrUpdated: 0 }
  }

  const result = await SoldCarModel.bulkWrite(operations)
  return {
    synced: soldVehicles.length,
    insertedOrUpdated: (result.upsertedCount || 0) + (result.modifiedCount || 0),
  }
}

/** Coalesce background refreshes and avoid rewriting the archive on each visit. */
export async function refreshSoldCarsIfStale(): Promise<void> {
  if (soldRefreshPromise) return soldRefreshPromise
  if (soldRefreshTimestamp !== null && Date.now() - soldRefreshTimestamp < DMS_CACHE_DURATION) return

  // Also back off on failures so a feed outage does not start a sync per visitor.
  soldRefreshTimestamp = Date.now()
  soldRefreshPromise = syncSoldCarsFromDMS().then(() => undefined)
  try {
    await soldRefreshPromise
  } finally {
    soldRefreshPromise = null
  }
}

export type SoldListingsQuery = {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
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
  colour?: string
  /** Free text: matches make, model, colour or derivative (contains, any case) */
  search?: string
}

const visibleSoldMatch = () => ({
  $or: [
    { showAfter30Days: true },
    { soldDate: { $gte: new Date(Date.now() - RECENT_SOLD_DAYS * 86400000) } },
  ],
})

// `a || b` as MongoDB sees it: b when a is missing, null, '', 0 or false
const either = (a: unknown, b: unknown) => ({
  $cond: [
    {
      $and: [
        { $ne: [{ $ifNull: [a, null] }, null] },
        { $ne: [a, ''] },
        { $ne: [a, 0] },
        { $ne: [a, false] },
      ],
    },
    a,
    b,
  ],
})
const V = '$vehicle.vehicle'
const lowerOf = (field: string) => ({
  $toLower: { $ifNull: [either(`${V}.${field}`, `${V}.standard.${field}`), ''] },
})
const PRICE = either('$vehicle.adverts.forecourtPrice.amountGBP', '$vehicle.adverts.retailAdverts.totalPrice.amountGBP')

/** Sort key per sortBy, as the listing page has always sorted (missing values as before). */
const SORT_KEYS: Record<string, unknown> = {
  price: either(PRICE, 0),
  year: either(`${V}.yearOfManufacture`, 0),
  mileage: either(`${V}.odometerReadingMiles`, 999999),
  make: lowerOf('make'),
  model: lowerOf('model'),
  fuelType: lowerOf('fuelType'),
  dateAdded: {
    $convert: {
      input: either('$vehicle.metadata.dateOnForecourt', '$vehicle.metadata.lastUpdated'),
      to: 'date',
      onError: null,
      onNull: null,
    },
  },
}

/** The listing filters, applied by MongoDB (case-insensitive names, numeric ranges). */
function soldFilterConditions(q: SoldListingsQuery): Record<string, unknown>[] {
  const conditions: Record<string, unknown>[] = []
  const nameEquals = (field: string, value?: string) => {
    if (value) conditions.push({ $eq: [lowerOf(field), value.toLowerCase()] })
  }
  const inRange = (value: unknown, min?: number, max?: number) => {
    if (typeof min === 'number') conditions.push({ $and: [{ $isNumber: value }, { $gte: [value, min] }] })
    if (typeof max === 'number') conditions.push({ $and: [{ $isNumber: value }, { $lte: [value, max] }] })
  }
  nameEquals('make', q.make)
  nameEquals('model', q.model)
  inRange(PRICE, q.minPrice, q.maxPrice)
  inRange(`${V}.odometerReadingMiles`, q.minMileage, q.maxMileage)
  nameEquals('fuelType', q.fuelType)
  nameEquals('bodyType', q.bodyType)
  nameEquals('transmissionType', q.transmissionType)
  inRange(`${V}.yearOfManufacture`, q.minYear, q.maxYear)
  nameEquals('colour', q.colour)
  const text = q.search?.trim()
  if (text) {
    // Plain text, not a pattern: escape regex characters
    const pattern = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    conditions.push({
      $or: ['make', 'model', 'colour', 'derivative'].map((field) => ({
        $regexMatch: { input: lowerOf(field), regex: pattern, options: 'i' },
      })),
    })
  }
  return conditions
}

/** AutoTrader image links stored with an unfilled `{resize}` size redirect instead of loading. */
function withSizedImages(vehicle: AutoTraderVehicle): AutoTraderVehicle {
  const images = vehicle.media?.images
  if (!images?.some((image) => image?.href?.includes('{resize}'))) return vehicle
  return {
    ...vehicle,
    media: {
      ...vehicle.media,
      images: images.map((image) =>
        image?.href ? { ...image, href: image.href.replace('{resize}', 'w800') } : image,
      ),
    },
  }
}

/**
 * One page of the visible sold cars, filtered, sorted and paged by MongoDB, plus the total
 * matching count and the makes / models for the filter dropdowns. Only the requested page's
 * cars are read in full (without the features list, which the sold pages never show): reading
 * all of them on every visit took ~22-27s (05/10/2026).
 */
export async function querySoldCarListings(q: SoldListingsQuery): Promise<{
  vehicles: AutoTraderVehicle[]
  totalResults: number
  makeModelVehicles: AutoTraderVehicle[]
}> {
  await connectDB()
  const filters = soldFilterConditions(q)
  const sortKey = SORT_KEYS[q.sortBy]
  const direction = q.sortOrder === 'asc' ? 1 : -1
  const pipeline: PipelineStage[] = [
    { $match: visibleSoldMatch() },
    ...(filters.length ? [{ $match: { $expr: { $and: filters } } }] : []),
    {
      $facet: {
        total: [{ $count: 'n' }],
        page: [
          ...(sortKey ? [{ $addFields: { _sortKey: sortKey } }] : []),
          // Ties keep the archive order (most recently sold first), as before
          {
            $sort: sortKey
              ? { _sortKey: direction, soldDate: -1, updatedAt: -1, _id: 1 }
              : { soldDate: -1, updatedAt: -1, _id: 1 },
          },
          { $skip: (q.page - 1) * q.pageSize },
          { $limit: q.pageSize },
          { $project: { vehicle: 1 } },
          { $project: { 'vehicle.features': 0 } },
        ],
      },
    },
  ]
  const [result, makeModelRecords] = await Promise.all([
    SoldCarModel.aggregate<{ total: { n: number }[]; page: { vehicle: AutoTraderVehicle }[] }>(pipeline)
      .collation({ locale: 'en' }),
    // Only the four name fields of every visible car, for the make / model dropdowns
    SoldCarModel.find(visibleSoldMatch(), {
      'vehicle.vehicle.make': 1,
      'vehicle.vehicle.model': 1,
      'vehicle.vehicle.standard.make': 1,
      'vehicle.vehicle.standard.model': 1,
    })
      .sort({ soldDate: -1, updatedAt: -1, _id: 1 })
      .lean<{ vehicle: AutoTraderVehicle }[]>(),
  ])
  const facet = result[0]
  return {
    vehicles: (facet?.page || []).map((record) => withSizedImages(record.vehicle)),
    totalResults: facet?.total[0]?.n || 0,
    makeModelVehicles: makeModelRecords.map((record) => record.vehicle),
  }
}

export async function getSoldCarVehicleByStockId(stockId: string): Promise<AutoTraderVehicle | null> {
  await connectDB()
  const record = await SoldCarModel.findOne({ stockId }).lean<LeanSoldCar | null>()
  return record?.vehicle || null
}

export async function getSoldCarsForAdmin(): Promise<SoldCarAdminRecord[]> {
  await connectDB()
  const records = await SoldCarModel.find({})
    .sort({ soldDate: -1, updatedAt: -1 })
    .lean<LeanSoldCar[]>()

  return records.map(serializeSoldCar)
}

export async function updateSoldCarsShowAfter30Days(ids: string[], showAfter30Days: boolean): Promise<number> {
  const cleanIds = ids.map((id) => id.trim()).filter(Boolean)
  if (cleanIds.length === 0) return 0

  await connectDB()
  const result = await SoldCarModel.updateMany(
    { _id: { $in: cleanIds } },
    { $set: { showAfter30Days } },
  )

  return result.modifiedCount || 0
}

export async function updateSoldCarShowAfter30Days(
  id: string,
  showAfter30Days: boolean,
): Promise<SoldCarAdminRecord | null> {
  await connectDB()
  const record = await SoldCarModel.findByIdAndUpdate(
    id,
    { $set: { showAfter30Days } },
    { new: true, runValidators: true },
  ).lean<LeanSoldCar | null>()

  return record ? serializeSoldCar(record) : null
}
