import type { WishlistVehicle } from '@/contexts/WishlistContext'
import type { AutoTraderVehicle } from './autotrader'
import { generateVehicleSlug } from './formatVehicleData'
import { engineSizeLabel } from './stockFilters'

/** What the shortlist keeps for a saved car: enough to show it and compare it without the stock feed. */
export function toWishlistVehicle(vehicle: AutoTraderVehicle): WishlistVehicle {
  const v = vehicle.vehicle
  const make = v?.make || v?.standard?.make || ''
  const model = v?.model || v?.standard?.model || ''
  const price = vehicle.adverts?.forecourtPrice?.amountGBP ?? vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP ?? null
  const engine = engineSizeLabel(vehicle)
  return {
    stockId: vehicle.metadata?.stockId || '',
    title: [make, model].filter(Boolean).join(' '),
    make,
    model,
    year: v?.yearOfManufacture ? String(v.yearOfManufacture) : undefined,
    price: price ? String(price) : undefined,
    image: vehicle.media?.images?.find((image) => image?.href)?.href || null,
    mileage: typeof v?.odometerReadingMiles === 'number' ? String(v.odometerReadingMiles) : undefined,
    fuel: v?.fuelType || v?.standard?.fuelType || undefined,
    transmission: v?.transmissionType || v?.standard?.transmissionType || undefined,
    bodyType: v?.bodyType || v?.standard?.bodyType || undefined,
    engineSize: engine ? `${engine}L` : undefined,
    colour: v?.colour || v?.standard?.colour || undefined,
    doors: v?.doors ? String(v.doors) : undefined,
    seats: v?.seats ? String(v.seats) : undefined,
    href: `/usedcars/${generateVehicleSlug(vehicle)}`,
  }
}

export const MAX_COMPARE = 3

/** Ticks a car for comparison; refuses a 4th. Returns the new selection and a message when refused. */
export function toggleCompare(selected: string[], stockId: string): { selected: string[]; refused: boolean } {
  if (selected.includes(stockId)) return { selected: selected.filter((id) => id !== stockId), refused: false }
  if (selected.length >= MAX_COMPARE) return { selected, refused: true }
  return { selected: [...selected, stockId], refused: false }
}
