import connectDB from '../lib/db/connect'
import VehicleOverrideModel from '../lib/db/models/vehicleOverride.model'
import type { AutoTraderVehicle } from './autotrader'

/**
 * Applies local MongoDB overrides (attentionGrabber, reservationStatus, listingPrice) to a single vehicle.
 * The vehicle is mutated via a deep clone — the original is never touched.
 */
export function applyOverrideToVehicle(
  vehicle: AutoTraderVehicle,
  override: { attentionGrabber?: string | null; reservationStatus?: string | null; listingPrice?: number | null } | null | undefined,
): AutoTraderVehicle {
  if (!override) return vehicle

  // Work on a shallow-merged copy so we don't mutate cache entries
  const v: AutoTraderVehicle = {
    ...vehicle,
    adverts: {
      ...vehicle.adverts,
      forecourtPrice: { ...vehicle.adverts?.forecourtPrice },
      retailAdverts: {
        ...vehicle.adverts?.retailAdverts,
      },
    },
  }

  if (override.listingPrice != null) {
    v.adverts.forecourtPrice.amountGBP = override.listingPrice
    v.adverts.retailAdverts.totalPrice = {
      ...v.adverts.retailAdverts.totalPrice,
      amountGBP: override.listingPrice,
    }
  }

  if (override.attentionGrabber != null) {
    v.adverts.retailAdverts.attentionGrabber = override.attentionGrabber
  }

  if (override.reservationStatus != null) {
    v.adverts.retailAdverts.reservationStatus = override.reservationStatus
  }

  return v
}

/**
 * Fetches all vehicle overrides for the given stockIds and returns a lookup map.
 */
export async function fetchOverridesMap(
  stockIds: string[],
): Promise<Map<string, { attentionGrabber?: string | null; reservationStatus?: string | null; listingPrice?: number | null }>> {
  if (stockIds.length === 0) return new Map()

  try {
    await connectDB()
    const overrides = await VehicleOverrideModel.find(
      { stockId: { $in: stockIds } },
      { stockId: 1, attentionGrabber: 1, reservationStatus: 1, listingPrice: 1, _id: 0 },
    ).lean()

    const map = new Map<string, { attentionGrabber?: string | null; reservationStatus?: string | null; listingPrice?: number | null }>()
    for (const o of overrides) {
      map.set(o.stockId, { attentionGrabber: o.attentionGrabber, reservationStatus: o.reservationStatus, listingPrice: o.listingPrice })
    }
    return map
  } catch (err) {
    // Non-fatal: if DB is unreachable, just skip overrides
    console.error('vehicleOverrides: failed to fetch overrides from DB', err)
    return new Map()
  }
}

/**
 * Applies local DB overrides to a batch of vehicles.
 * A single DB query fetches all needed overrides.
 */
export async function applyVehicleOverrides(
  vehicles: AutoTraderVehicle[],
): Promise<AutoTraderVehicle[]> {
  if (!vehicles.length) return vehicles

  const stockIds = vehicles.map((v) => v?.metadata?.stockId).filter(Boolean) as string[]
  const overridesMap = await fetchOverridesMap(stockIds)

  if (overridesMap.size === 0) return vehicles

  return vehicles.map((v) => applyOverrideToVehicle(v, overridesMap.get(v?.metadata?.stockId)))
}
