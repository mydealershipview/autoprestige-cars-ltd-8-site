import connectDB from '@/lib/db/connect'
import SoldCarModel, { type ISoldCar } from '@/lib/db/models/soldCar.model'
import { fetchAutoTraderListings, type AutoTraderVehicle } from '@/utilities/autotrader'

const DMS_CACHE_DURATION = 5 * 60 * 1000
const RECENT_SOLD_DAYS = 30

let dmsSoldCache: AutoTraderVehicle[] | null = null
let dmsSoldCacheTimestamp: number | null = null

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
  const soldListings: AutoTraderVehicle[] = []

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
      const results = data.data?.vehicles || []

      if (results.length > 0) {
        soldListings.push(
          ...results.filter((vehicle: AutoTraderVehicle) => vehicle.metadata?.lifecycleState === 'SOLD'),
        )

        const total = data.data?.pagination?.totalResults || results.length
        const totalPages = Math.ceil(total / pageSize)
        hasMoreData = currentPage < totalPages
        currentPage += 1
      } else {
        hasMoreData = false
      }
    }

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

export async function getVisibleSoldCarVehicles(): Promise<AutoTraderVehicle[]> {
  await connectDB()
  const cutoff = new Date(Date.now() - RECENT_SOLD_DAYS * 86400000)
  const records = await SoldCarModel.find({
    $or: [{ showAfter30Days: true }, { soldDate: { $gte: cutoff } }],
  })
    .sort({ soldDate: -1, updatedAt: -1 })
    .lean<LeanSoldCar[]>()

  return records.map((record) => record.vehicle)
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
