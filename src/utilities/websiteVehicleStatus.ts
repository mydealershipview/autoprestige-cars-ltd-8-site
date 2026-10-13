import type { WebsiteVehicle } from '@/lib/services/dmsWebsiteStock'

/** Either lifecycle or advert reservation can mark normal stock as Reserved.
 * Explicit website-only snapshots follow the separate DMS retention toggle. */
export function isReserved(vehicle: WebsiteVehicle): boolean {
  if (vehicle.websiteOnly === true && vehicle.reserved === true) return true
  const state = vehicle.lifecycleState ?? vehicle.metadata?.lifecycleState
  const reservation = vehicle.adverts?.reservationStatus ?? vehicle.adverts?.retailAdverts?.reservationStatus ?? ''
  return vehicle.reserved === true || state === 'SALE_IN_PROGRESS' || /^reserved$/i.test(reservation.trim())
}

export function isLiveListing(vehicle: WebsiteVehicle): boolean {
  const state = vehicle.lifecycleState ?? vehicle.metadata?.lifecycleState
  if (vehicle.websiteOnly === true && vehicle.reserved === true) return true
  return ['FORECOURT', 'SALE_IN_PROGRESS'].includes(state ?? '') &&
    (vehicle.adverts?.retailAdverts?.advertiserAdvert?.status === 'PUBLISHED' ||
      (vehicle as WebsiteVehicle & { advertiserAdvertStatus?: string }).advertiserAdvertStatus === 'PUBLISHED')
}

