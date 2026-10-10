import type { AutoTraderVehicle } from './autotrader'

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

  return {
    ...raw,
    metadata,
    vehicle: {
      ...raw.vehicle,
      registration: raw.vehicle?.registration ?? raw.registration ?? null,
      make: raw.vehicle?.make ?? raw.make,
      model: raw.vehicle?.model ?? raw.model,
      yearOfManufacture: raw.vehicle?.yearOfManufacture ?? (raw.yearOfManufacture != null ? Number(raw.yearOfManufacture) : null),
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
