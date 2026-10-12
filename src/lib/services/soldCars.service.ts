import { getDmsWebsiteVehicles, type WebsiteVehicle } from './dmsWebsiteStock'

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
  search?: string
}

const name = (car: WebsiteVehicle, field: 'make' | 'model' | 'fuelType' | 'bodyType' | 'transmissionType' | 'colour' | 'derivative') =>
  car.vehicle[field] || (car.vehicle.standard as Record<string, unknown> | undefined)?.[field] || ''
const price = (car: WebsiteVehicle) => car.adverts.forecourtPrice?.amountGBP || car.adverts.retailAdverts?.totalPrice?.amountGBP
const inRange = (value: number | null | undefined, min?: number, max?: number) =>
  (min === undefined || (typeof value === 'number' && value >= min)) &&
  (max === undefined || (typeof value === 'number' && value <= max))
const soldTime = (car: WebsiteVehicle) => Date.parse(car.soldAt ?? '') || 0

/** The DMS toggle is the dealer's explicit retention choice. Ticked cars stay until it is turned
 * off, as manually retained cars did before. No static/Mongo archive or website visibility edits:
 * a toggle-off must actually remove the advert, even when the car is stale at AutoTrader. */
export async function fetchSoldVehiclesFromDMS(): Promise<WebsiteVehicle[]> {
  return getDmsWebsiteVehicles('sold')
}

export async function querySoldCarListings(q: SoldListingsQuery): Promise<{
  vehicles: WebsiteVehicle[]
  totalResults: number
  makeModelVehicles: WebsiteVehicle[]
}> {
  const all = await fetchSoldVehiclesFromDMS()
  const matches = all.filter(car => {
    for (const field of ['make', 'model', 'fuelType', 'bodyType', 'transmissionType', 'colour'] as const) {
      if (q[field] && String(name(car, field)).toLowerCase() !== q[field]!.toLowerCase()) return false
    }
    if (!inRange(price(car), q.minPrice, q.maxPrice) ||
        !inRange(car.vehicle.odometerReadingMiles, q.minMileage, q.maxMileage) ||
        !inRange(car.vehicle.yearOfManufacture, q.minYear, q.maxYear)) return false
    return !q.search || ['make', 'model', 'colour', 'derivative'].some(field =>
      String(name(car, field as 'make')).toLowerCase().includes(q.search!.toLowerCase()))
  })
  const key = (car: WebsiteVehicle): string | number => {
    switch (q.sortBy) {
      case 'price': return price(car) || 0
      case 'year': return car.vehicle.yearOfManufacture || 0
      case 'mileage': return car.vehicle.odometerReadingMiles || 999999
      case 'make': case 'model': case 'fuelType': return String(name(car, q.sortBy)).toLowerCase()
      case 'dateAdded': return soldTime(car)
      default: return soldTime(car)
    }
  }
  matches.sort((a, b) => {
    const left = key(a), right = key(b)
    const comparison = typeof left === 'string' && typeof right === 'string'
      ? left.localeCompare(right, 'en') : Number(left) - Number(right)
    return comparison * (q.sortOrder === 'asc' ? 1 : -1) || soldTime(b) - soldTime(a) ||
      a.metadata.stockId.localeCompare(b.metadata.stockId)
  })
  return {
    vehicles: matches.slice((q.page - 1) * q.pageSize, q.page * q.pageSize),
    totalResults: matches.length,
    makeModelVehicles: all,
  }
}

export async function getSoldCarVehicleByStockId(stockId: string): Promise<WebsiteVehicle | null> {
  return (await fetchSoldVehiclesFromDMS()).find(car => car.metadata.stockId === stockId) ?? null
}
