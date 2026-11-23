import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
const nav = vi.hoisted(() => ({ push: vi.fn(), query: 'make=BMW' }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: nav.push }),
  useSearchParams: () => new URLSearchParams(nav.query),
}))
vi.mock('@/hooks/useSoldVehicles', () => ({ useSoldVehicles: () => ({ vehicles: [], loading: false, error: null, retry: vi.fn() }) }))
vi.mock('@/lib/analytics', () => ({ trackLead: vi.fn(), trackEvent: vi.fn() }))
import UsedCarsComponent from '@/app/(frontend)/usedcars/_components/index'
import { WishlistProvider } from '@/contexts/WishlistContext'

const facets = [
  { make: 'BMW', model: 'X5', price: 30000, mileage: 40000, year: 2020, fuelType: 'Diesel', bodyType: 'SUV', transmissionType: 'Automatic', colour: 'Black', engineSize: '3.0', doors: '5', seats: '7' },
  { make: 'BMW', model: '320d', price: 15000, mileage: 60000, year: 2018, fuelType: 'Diesel', bodyType: 'Saloon', transmissionType: 'Manual', colour: 'White', engineSize: '2.0', doors: '4', seats: '5' },
  { make: 'Audi', model: 'A3', price: 12000, mileage: 30000, year: 2019, fuelType: 'Petrol', bodyType: 'Hatchback', transmissionType: 'Manual', colour: 'Black', engineSize: '1.5', doors: '5', seats: '5' },
]
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); nav.push.mockClear() })

function stubListings(results: unknown[]) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
    results, totalResults: results.length,
    availableMakes: [{ makeId: 'audi', name: 'Audi' }, { makeId: 'bmw', name: 'BMW' }],
    availableModels: [{ makeId: 'bmw', makeName: 'BMW', modelId: 'bmw-x5', name: 'X5' }, { makeId: 'bmw', makeName: 'BMW', modelId: 'bmw-320d', name: '320d' }],
    facets,
  }), { status: 200 })))
}

describe('stock list page', () => {
  it('shows live counts on options and writes new filters to the URL', async () => {
    nav.query = 'make=BMW'
    stubListings([])
    render(React.createElement(WishlistProvider, null, React.createElement(UsedCarsComponent)))
    await waitFor(() => expect(screen.getByRole('option', { name: 'BMW (2)' })).toBeDefined())
    expect(screen.getByRole('option', { name: 'Audi (1)' })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Seats' }))
    expect(screen.getByRole('option', { name: '7 (1)' })).toBeDefined()
    fireEvent.change(screen.getByLabelText('Seats'), { target: { value: '7' } })
    expect(nav.push).toHaveBeenCalledWith('?make=BMW&seats=7', { scroll: false })
    // Empty result with the alerts switch off (default): the empty state is as before, no alert form
    expect(screen.getByText('No vehicles found')).toBeDefined()
    expect(screen.queryByRole('heading', { name: 'Notify me when one arrives' })).toBeNull()
  })

  it('offers the notify-me alert on the empty state only when the switch is on', async () => {
    vi.stubEnv('NEXT_PUBLIC_STOCK_ALERTS_ENABLED', 'true')
    nav.query = 'make=BMW&seats=9'
    stubListings([])
    render(React.createElement(WishlistProvider, null, React.createElement(UsedCarsComponent)))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Notify me when one arrives' })).toBeDefined())
    expect(screen.getByText("We'll only contact you about this car or similar vehicles.")).toBeDefined()
  })
})
