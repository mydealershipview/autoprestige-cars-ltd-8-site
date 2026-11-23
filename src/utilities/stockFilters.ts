import type { AutoTraderVehicle } from './autotrader'

/**
 * Stock list filters (Website Upgrade Spec section 4). One definition of every filter, used by
 * /api/listings to filter and by the stock list page to count, so "BMW (4)" always matches the
 * cars the list then shows. Filter state lives in the URL query under these names.
 */
export const FILTER_KEYS = [
  'make', 'model', 'minPrice', 'maxPrice', 'fuelType', 'bodyType', 'transmissionType', 'minYear', 'maxYear',
  'colour', 'minMileage', 'maxMileage', 'engineSize', 'doors', 'seats',
] as const
export type FilterKey = (typeof FILTER_KEYS)[number]
export type ListingsFilters = Record<FilterKey, string>

/** The values one car is filtered on (sent to the browser so it can count options). */
export interface FacetRow {
  make: string
  model: string
  price: number | null
  mileage: number | null
  year: number | null
  fuelType: string
  bodyType: string
  transmissionType: string
  colour: string
  engineSize: string
  doors: string
  seats: string
}

export function emptyFilters(): ListingsFilters {
  return Object.fromEntries(FILTER_KEYS.map((key) => [key, ''])) as ListingsFilters
}

export function filtersFromParams(params: { get(name: string): string | null }): ListingsFilters {
  const filters = emptyFilters()
  for (const key of FILTER_KEYS) filters[key] = params.get(key) || ''
  return filters
}

/** Engine size as the car page shows it: badge litres to one decimal place, e.g. "2.0". */
export function engineSizeLabel(vehicle: AutoTraderVehicle): string {
  const litres = vehicle.vehicle?.badgeEngineSizeLitres
    ?? (vehicle.vehicle?.engineCapacityCC ? vehicle.vehicle.engineCapacityCC / 1000 : null)
  return typeof litres === 'number' && litres > 0 ? litres.toFixed(1) : ''
}

export function toFacetRow(vehicle: AutoTraderVehicle): FacetRow {
  const v = vehicle.vehicle
  // Same price the list has always filtered on (forecourt, else the advert total)
  const price = vehicle.adverts?.forecourtPrice?.amountGBP || vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP
  return {
    make: v?.make || v?.standard?.make || '',
    model: v?.model || v?.standard?.model || '',
    price: typeof price === 'number' ? price : null,
    mileage: typeof v?.odometerReadingMiles === 'number' ? v.odometerReadingMiles : null,
    year: typeof v?.yearOfManufacture === 'number' ? v.yearOfManufacture : null,
    fuelType: v?.fuelType || v?.standard?.fuelType || '',
    bodyType: v?.bodyType || v?.standard?.bodyType || '',
    transmissionType: v?.transmissionType || v?.standard?.transmissionType || '',
    colour: v?.colour || v?.standard?.colour || '',
    engineSize: engineSizeLabel(vehicle),
    doors: v?.doors ? String(v.doors) : '',
    seats: v?.seats ? String(v.seats) : '',
  }
}

const num = (value: string) => {
  if (!value) return undefined
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}
const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export function rowMatches(row: FacetRow, filters: ListingsFilters): boolean {
  for (const key of ['make', 'model', 'fuelType', 'bodyType', 'transmissionType', 'colour', 'engineSize', 'doors', 'seats'] as const) {
    if (filters[key] && (!row[key] || !same(row[key], filters[key]))) return false
  }
  const ranges: Array<[number | null, number | undefined, number | undefined]> = [
    [row.price, num(filters.minPrice), num(filters.maxPrice)],
    [row.mileage, num(filters.minMileage), num(filters.maxMileage)],
    [row.year, num(filters.minYear), num(filters.maxYear)],
  ]
  for (const [value, min, max] of ranges) {
    if (min !== undefined && (value === null || value < min)) return false
    if (max !== undefined && (value === null || value > max)) return false
  }
  return true
}

export function filterVehicles<T extends AutoTraderVehicle>(vehicles: T[], filters: ListingsFilters): T[] {
  return vehicles.filter((vehicle) => rowMatches(toFacetRow(vehicle), filters))
}

/** How many cars match if `change` is applied to the current filters (the other filters stay). */
export function countWith(rows: FacetRow[], filters: ListingsFilters, change: Partial<ListingsFilters>): number {
  const next = { ...filters, ...change }
  return rows.filter((row) => rowMatches(row, next)).length
}

export type OptionKey = 'make' | 'model' | 'fuelType' | 'bodyType' | 'transmissionType' | 'colour' | 'engineSize' | 'doors' | 'seats'

/**
 * Options for a list filter, from the cars in stock, each with its live count given the other
 * active filters. Picking a make clears the model, so make counts ignore the model. The selected
 * value is always kept, even when nothing matches it any more.
 */
export function facetOptions(rows: FacetRow[], filters: ListingsFilters, key: OptionKey): Array<{ value: string; count: number }> {
  const scope = key === 'model' && filters.make ? rows.filter((row) => same(row.make, filters.make)) : rows
  const values = new Map<string, string>()
  for (const row of scope) if (row[key]) values.set(row[key].toLowerCase(), values.get(row[key].toLowerCase()) ?? row[key])
  if (filters[key] && !values.has(filters[key].toLowerCase())) values.set(filters[key].toLowerCase(), filters[key])
  const numeric = key === 'engineSize' || key === 'doors' || key === 'seats'
  return [...values.values()]
    .sort((a, b) => (numeric ? Number(a) - Number(b) : a.localeCompare(b)))
    .map((value) => ({
      value,
      count: countWith(rows, filters, key === 'make' ? { make: value, model: '' } : { [key]: value }),
    }))
}

/** Years in stock, newest first. */
export function stockYears(rows: FacetRow[], filters: ListingsFilters): string[] {
  const years = new Set(rows.flatMap((row) => (row.year ? [String(row.year)] : [])))
  for (const key of ['minYear', 'maxYear'] as const) if (filters[key]) years.add(filters[key])
  return [...years].sort((a, b) => Number(b) - Number(a))
}

export function withCount(label: string, count: number) {
  return `${label} (${count})`
}

const SUMMARY_LABELS: Record<FilterKey, string> = {
  make: 'Make', model: 'Model', minPrice: 'Price from £', maxPrice: 'Price to £', fuelType: 'Fuel',
  bodyType: 'Body type', transmissionType: 'Gearbox', minYear: 'Year from', maxYear: 'Year to', colour: 'Colour',
  minMileage: 'Mileage from', maxMileage: 'Mileage to', engineSize: 'Engine (L)', doors: 'Doors', seats: 'Seats',
}

/** The active filters in words, e.g. "Make: BMW, Model: X5, Price to £20000". */
export function describeFilters(filters: ListingsFilters): string {
  const parts = FILTER_KEYS.filter((key) => filters[key]).map((key) => {
    const label = SUMMARY_LABELS[key]
    return label.endsWith('£') ? `${label}${filters[key]}` : `${label}: ${filters[key]}`
  })
  return parts.length ? parts.join(', ') : 'any car'
}
