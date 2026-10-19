import type { WebsiteVehicle } from '@/lib/services/dmsWebsiteStock'

const status = (value: unknown): string => typeof value === 'string' ? value.trim().toUpperCase() : ''
const lifecycle = (vehicle: WebsiteVehicle): string =>
  status(vehicle.lifecycleState) || status(vehicle.metadata?.lifecycleState)

/** Either lifecycle or advert reservation can mark normal stock as Reserved.
 * Explicit website-only snapshots follow the separate DMS retention toggle. */
export function isReserved(vehicle: WebsiteVehicle): boolean {
  if (vehicle.websiteOnly === true && vehicle.reserved === true) return true
  return vehicle.reserved === true || lifecycle(vehicle) === 'SALE_IN_PROGRESS' ||
    status(vehicle.adverts?.reservationStatus) === 'RESERVED' ||
    status(vehicle.adverts?.retailAdverts?.reservationStatus) === 'RESERVED'
}

/** AutoTrader can unpublish every advertising channel at SALE_IN_PROGRESS.
 * Reservation signals keep an active DMS car visible independently of those channels.
 * Ordinary unpublished cars and terminal stock must still stay off the showroom. */
export function isLiveListing(vehicle: WebsiteVehicle): boolean {
  if (vehicle.websiteOnly === true) return vehicle.reserved === true
  if (!['FORECOURT', 'SALE_IN_PROGRESS'].includes(lifecycle(vehicle))) return false
  return isReserved(vehicle) ||
    status(vehicle.adverts?.retailAdverts?.advertiserAdvert?.status) === 'PUBLISHED' ||
    status((vehicle as WebsiteVehicle & { advertiserAdvertStatus?: string }).advertiserAdvertStatus) === 'PUBLISHED'
}
