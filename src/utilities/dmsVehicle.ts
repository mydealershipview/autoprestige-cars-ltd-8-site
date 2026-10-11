import type { AutoTraderVehicle } from './autotrader'

/**
 * The DMS API no longer sends firstRegistrationDate, which the finance plugin
 * needs. Estimate it from a current-style plate's age identifier (Mar/Sep),
 * falling back to 1 Jan of the year of manufacture.
 */
function estimateFirstRegistrationDate(plate: unknown, year: number | null): string | null {
  const m = typeof plate === 'string' ? plate.replace(/\s+/g, '').toUpperCase().match(/^[A-Z]{2}(\d{2})[A-Z]{3}$/) : null
  if (m) {
    const n = Number(m[1])
    const plateYear = 2000 + (n >= 51 ? n - 50 : n)
    if (year == null || Math.abs(plateYear - year) <= 1) {
      return `${plateYear}-${n >= 51 ? '09' : '03'}-01`
    }
  }
  return year ? `${year}-01-01` : null
}

/**
 * The MyDealershipView stock API now returns a flattened vehicle shape:
 * stockId / lifecycleState / forecourtPrice live at the top level and there is
 * no `metadata` object. The rest of the app expects the AutoTrader shape, so
 * map DMS vehicles back to it. Vehicles already in the old shape pass through.
 */
export function normalizeDmsVehicle(raw: any): AutoTraderVehicle {
  if (!raw || typeof raw !== 'object') return raw

  const metadata = {
    ...raw.metadata,
    stockId: raw.metadata?.stockId ?? raw.stockId,
    lifecycleState: raw.metadata?.lifecycleState ?? raw.lifecycleState,
    lastUpdated: raw.metadata?.lastUpdated ?? raw.lastUpdated,
    dateOnForecourt: raw.metadata?.dateOnForecourt ?? raw.dateOnForecourt,
  }

  const price = raw.adverts?.forecourtPrice?.amountGBP
    ?? raw.forecourtPrice?.amountGBP
    ?? raw.adverts?.retailAdverts?.totalPrice?.amountGBP
    ?? null

  const retailAdverts = raw.adverts?.retailAdverts || {}
  const registration = raw.vehicle?.registration ?? raw.registration ?? null
  const year = raw.vehicle?.yearOfManufacture ?? (raw.yearOfManufacture != null ? Number(raw.yearOfManufacture) : null)

  return {
    ...raw,
    metadata,
    vehicle: {
      ...raw.vehicle,
      registration,
      firstRegistrationDate: raw.vehicle?.firstRegistrationDate ?? estimateFirstRegistrationDate(registration, year),
      make: raw.vehicle?.make ?? raw.make,
      model: raw.vehicle?.model ?? raw.model,
      yearOfManufacture: year,
      odometerReadingMiles: raw.vehicle?.odometerReadingMiles ?? raw.odometerReadingMiles ?? null,
    },
    adverts: {
      ...raw.adverts,
      forecourtPrice: { ...raw.adverts?.forecourtPrice, amountGBP: price },
      retailAdverts: {
        ...retailAdverts,
        totalPrice: { ...retailAdverts.totalPrice, amountGBP: retailAdverts.totalPrice?.amountGBP ?? price },
      },
    },
    media: { images: [], ...raw.media },
    features: raw.features || [],
  } as AutoTraderVehicle
}

export function normalizeDmsVehicles(raw: unknown): AutoTraderVehicle[] {
  return Array.isArray(raw) ? raw.map(normalizeDmsVehicle) : []
}

/**
 * The new API only returns live stock and no longer exposes an advert status,
 * so a missing status counts as published.
 */
export function isPublishedForecourtVehicle(vehicle: any): boolean {
  if (vehicle?.metadata?.lifecycleState !== 'FORECOURT') return false
  const status = vehicle.adverts?.retailAdverts?.advertiserAdvert?.status ?? vehicle.advertiserAdvertStatus
  return status === undefined || status === 'PUBLISHED'
}
