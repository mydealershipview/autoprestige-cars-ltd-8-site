import { readLegacySoldCars } from './legacySoldCars'
import { getDmsWebsiteInventoryVehicles, getDmsWebsiteVehicles, type WebsiteVehicle } from './dmsWebsiteStock'

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

const name = (car: WebsiteVehicle, field: 'make' | 'model' | 'fuelType' | 'bodyType' | 'transmissionType' | 'colour' | 'derivative' | 'registration') =>
  car.vehicle[field] || (car.vehicle.standard as Record<string, unknown> | undefined)?.[field] || ''
const price = (car: WebsiteVehicle) => car.adverts.forecourtPrice?.amountGBP || car.adverts.retailAdverts?.totalPrice?.amountGBP
const inRange = (value: number | null | undefined, min?: number, max?: number) =>
  (min === undefined || (typeof value === 'number' && value >= min)) &&
  (max === undefined || (typeof value === 'number' && value <= max))
const soldTime = (car: WebsiteVehicle) => Date.parse(car.soldAt ?? '') || 0

/** DMS controls its own records; only independent historical archive cars are added. */
export async function fetchSoldVehiclesFromDMS(): Promise<WebsiteVehicle[]> {
  return getDmsWebsiteVehicles('sold')
}

export async function fetchCombinedSoldVehicles(): Promise<WebsiteVehicle[]> {
  const [sold, inventory, live, legacy] = await Promise.all([
    fetchSoldVehiclesFromDMS(), getDmsWebsiteInventoryVehicles(),
    getDmsWebsiteVehicles('live'), readLegacySoldCars(),
  ])
  const registration = (car: WebsiteVehicle) => (car.vehicle.registration ?? '').replace(/\s/g, '').toUpperCase()
  const managed = [...inventory, ...sold, ...live]
  const ids = new Set(managed.flatMap(car => [car.metadata.stockId, car.sourceStockId].filter(Boolean)))
  const plates = new Set(managed.map(registration).filter(Boolean))
  const combined = [...sold]
  for (const car of legacy) {
    const plate = registration(car)
    if (ids.has(car.metadata.stockId) || (plate && plates.has(plate))) continue
    ids.add(car.metadata.stockId)
    if (plate) plates.add(plate)
    combined.push(car)
  }
  return combined
}

export async function querySoldCarListings(q: SoldListingsQuery): Promise<{
  vehicles: WebsiteVehicle[]
  totalResults: number
  makeModelVehicles: WebsiteVehicle[]
  page: number
}> {
  const all = await fetchCombinedSoldVehicles()
  const matches = all.filter(car => {
    for (const field of ['make', 'model', 'fuelType', 'bodyType', 'transmissionType', 'colour'] as const) {
      if (q[field] && String(name(car, field)).toLowerCase() !== q[field]!.toLowerCase()) return false
    }
    if (!inRange(price(car), q.minPrice, q.maxPrice) ||
        !inRange(car.vehicle.odometerReadingMiles, q.minMileage, q.maxMileage) ||
        !inRange(car.vehicle.yearOfManufacture, q.minYear, q.maxYear)) return false
    return !q.search || (['make', 'model', 'colour', 'derivative', 'registration'] as const).some(field =>
      String(name(car, field)).toLowerCase().includes(q.search!.toLowerCase()))
  })
  const key = (car: WebsiteVehicle): string | number => {
    switch (q.sortBy) {
      case 'price': return price(car) || 0
      case 'year': return car.vehicle.yearOfManufacture || 0
      case 'mileage': return car.vehicle.odometerReadingMiles ?? 999999
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
  const page = Math.min(q.page, Math.max(1, Math.ceil(matches.length / q.pageSize)))
  return {
    page,
    vehicles: matches.slice((page - 1) * q.pageSize, page * q.pageSize),
    totalResults: matches.length,
    makeModelVehicles: all,
  }
}

export async function getSoldCarVehicleByStockId(stockId: string): Promise<WebsiteVehicle | null> {
  return (await fetchCombinedSoldVehicles()).find(car => car.metadata.stockId === stockId) ?? null
}
