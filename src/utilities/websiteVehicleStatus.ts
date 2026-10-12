import type { WebsiteVehicle } from '@/lib/services/dmsWebsiteStock'

export function isReserved(vehicle: WebsiteVehicle): boolean {
  if (vehicle.reserved) {
    console.log("🚀 ~ isReserved ~ vehicle:", vehicle.reserved, vehicle.lifecycleState, vehicle.metadata?.lifecycleState, vehicle)
  }
  return vehicle.reserved === true ||
    (vehicle.lifecycleState ?? vehicle.metadata?.lifecycleState) === 'SALE_IN_PROGRESS' ||
    /^reserved$/i.test((vehicle.adverts?.reservationStatus ?? vehicle.adverts?.retailAdverts?.reservationStatus ?? '').trim())
}

export function isLiveListing(vehicle: WebsiteVehicle): boolean {
  const state = vehicle.lifecycleState ?? vehicle.metadata?.lifecycleState
  if (vehicle.websiteOnly === true && vehicle.reserved === true) return true
  return ['FORECOURT', 'SALE_IN_PROGRESS'].includes(state ?? '') &&
    (vehicle.adverts?.retailAdverts?.advertiserAdvert?.status === 'PUBLISHED' ||
      (vehicle as WebsiteVehicle & { advertiserAdvertStatus?: string }).advertiserAdvertStatus === 'PUBLISHED')
}

