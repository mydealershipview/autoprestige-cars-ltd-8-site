import type { WebsiteVehicle } from '@/lib/services/dmsWebsiteStock'

/** Real stock follows the DMS lifecycle. The raw advert reservation flag may be stale.
 * Only explicit website-only snapshots can override that lifecycle for display. */
export function isReserved(vehicle: WebsiteVehicle): boolean {
  if (vehicle.websiteOnly === true && vehicle.reserved === true) return true
  return (vehicle.lifecycleState ?? vehicle.metadata?.lifecycleState) === 'SALE_IN_PROGRESS'
}

export function isLiveListing(vehicle: WebsiteVehicle): boolean {
  const state = vehicle.lifecycleState ?? vehicle.metadata?.lifecycleState
  if (vehicle.websiteOnly === true && vehicle.reserved === true) return true
  return ['FORECOURT', 'SALE_IN_PROGRESS'].includes(state ?? '') &&
    (vehicle.adverts?.retailAdverts?.advertiserAdvert?.status === 'PUBLISHED' ||
      (vehicle as WebsiteVehicle & { advertiserAdvertStatus?: string }).advertiserAdvertStatus === 'PUBLISHED')
}

