// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({ read: vi.fn() }))
vi.mock('@/lib/services/dmsWebsiteStock', () => ({ getDmsWebsiteVehicles: mocks.read }))
vi.mock('@/utilities/mergePayloadData', () => ({ mergeVehiclesWithPayloadData: async (rows: unknown[]) => rows }))
import { GET as listings } from '@/app/api/listings/route'
import {
  countWith, describeFilters, emptyFilters, facetOptions, filtersFromParams, stockYears, toFacetRow,
} from '@/utilities/stockFilters'
import type { AutoTraderVehicle } from '@/utilities/autotrader'

const car = (id: string, v: Record<string, unknown>, price: number | null) => ({
  metadata: { stockId: id, lifecycleState: 'FORECOURT' },
  vehicle: { standard: {}, ...v },
  adverts: { forecourtPrice: { amountGBP: price }, retailAdverts: {} },
  media: { images: [] },
}) as unknown as AutoTraderVehicle

const stock = [
  car('a', { make: 'BMW', model: 'X5', fuelType: 'Diesel', bodyType: 'SUV', transmissionType: 'Automatic', colour: 'Black', badgeEngineSizeLitres: 3, doors: 5, seats: 7, yearOfManufacture: 2020, odometerReadingMiles: 40000 }, 30000),
  car('b', { make: 'BMW', model: '320d', fuelType: 'Diesel', bodyType: 'Saloon', transmissionType: 'Manual', colour: 'White', badgeEngineSizeLitres: 2, doors: 4, seats: 5, yearOfManufacture: 2018, odometerReadingMiles: 60000 }, 15000),
  car('c', { make: 'Audi', model: 'A3', fuelType: 'Petrol', bodyType: 'Hatchback', transmissionType: 'Manual', colour: 'Black', engineCapacityCC: 1498, doors: 5, seats: 5, yearOfManufacture: 2019, odometerReadingMiles: 30000 }, 12000),
  car('d', { make: 'Audi', model: 'Q5', fuelType: 'Diesel', bodyType: 'SUV', transmissionType: 'Automatic', colour: 'Grey', badgeEngineSizeLitres: 2, doors: 5, seats: 5, yearOfManufacture: 2021, odometerReadingMiles: 20000 }, null),
]
const rows = stock.map(toFacetRow)
const params = (query: string) => new URLSearchParams(query)

beforeEach(() => { vi.clearAllMocks(); mocks.read.mockResolvedValue(stock) })

describe('stock list filters: URL state', () => {
  it('reads every filter from the query and keeps old make/model links working', () => {
    const filters = filtersFromParams(params('make=BMW&model=X5&doors=5&engineSize=3.0&colour=Black&minPrice=1000'))
    expect(filters).toMatchObject({ make: 'BMW', model: 'X5', doors: '5', engineSize: '3.0', colour: 'Black', minPrice: '1000', seats: '' })
    expect(Object.values(emptyFilters()).every((value) => value === '')).toBe(true)
  })
  it('the API filters on the new filters too, and returns facet rows for counting', async () => {
    const get = async (query: string) => (await listings(new NextRequest(`http://localhost/api/listings?${query}`))).json()
    expect((await get('make=BMW&model=X5')).results.map((r: AutoTraderVehicle) => r.metadata.stockId)).toEqual(['a'])
    expect((await get('colour=black')).totalResults).toBe(2)
    expect((await get('seats=7')).totalResults).toBe(1)
    expect((await get('engineSize=2.0')).totalResults).toBe(2)
    expect((await get('engineSize=1.5&doors=5')).totalResults).toBe(1)
    // Unchanged behaviour: a car with no price never passes a price filter
    expect((await get('maxPrice=40000')).totalResults).toBe(3)
    const data = await get('')
    expect(data.totalResults).toBe(4)
    expect(data.facets).toHaveLength(4)
    expect(data.facets[2]).toMatchObject({ make: 'Audi', engineSize: '1.5', doors: '5', seats: '5', price: 12000 })
  })
})

describe('stock list filters: live counts', () => {
  it('counts each option given the other active filters', () => {
    const filters = { ...emptyFilters(), fuelType: 'Diesel' }
    expect(facetOptions(rows, filters, 'make')).toEqual([{ value: 'Audi', count: 1 }, { value: 'BMW', count: 2 }])
    // Its own filter is replaced, not stacked: Petrol still shows its count while Diesel is picked
    expect(facetOptions(rows, filters, 'fuelType')).toEqual([{ value: 'Diesel', count: 3 }, { value: 'Petrol', count: 1 }])
    expect(facetOptions(rows, filters, 'seats')).toEqual([{ value: '5', count: 2 }, { value: '7', count: 1 }])
    expect(facetOptions(rows, filters, 'engineSize')).toEqual([{ value: '1.5', count: 0 }, { value: '2.0', count: 2 }, { value: '3.0', count: 1 }])
  })
  it('lists models of the chosen make only, and keeps a selected value with no matches', () => {
    const filters = { ...emptyFilters(), make: 'BMW', colour: 'Silver' }
    expect(facetOptions(rows, filters, 'model')).toEqual([{ value: '320d', count: 0 }, { value: 'X5', count: 0 }])
    expect(facetOptions(rows, filters, 'colour')).toContainEqual({ value: 'Silver', count: 0 })
  })
  it('counts range options (price, year) and lists only years in stock', () => {
    const filters = { ...emptyFilters(), make: 'BMW' }
    expect(countWith(rows, filters, { minPrice: '20000' })).toBe(1)
    expect(countWith(rows, filters, { maxYear: '2019' })).toBe(1)
    expect(stockYears(rows, emptyFilters())).toEqual(['2021', '2020', '2019', '2018'])
  })
  it('describes the filters for alert leads', () => {
    expect(describeFilters({ ...emptyFilters(), make: 'BMW', model: 'X5', maxPrice: '20000' })).toBe('Make: BMW, Model: X5, Price to £20000')
    expect(describeFilters(emptyFilters())).toBe('any car')
  })
})
