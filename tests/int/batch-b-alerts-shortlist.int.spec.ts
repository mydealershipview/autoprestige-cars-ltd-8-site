import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
// Real spam guard: no visitor IP in these requests, so the limit store is never reached
vi.mock('@/lib/db/connect', () => ({ default: vi.fn() }))
vi.mock('mongoose', () => ({ default: { Schema: class { index() {} }, models: { WebsiteLeadLimit: { findOneAndUpdate: vi.fn() } } } }))
vi.mock('@/utilities/sendEmail', () => ({ sendEnquiryEmail: vi.fn().mockResolvedValue({ success: true }) }))
vi.mock('@/lib/analytics', () => ({ trackLead: vi.fn(), trackEvent: vi.fn() }))
import { POST } from '@/app/api/submit-form/route'
import NotifyMeForm from '@/app/(frontend)/usedcars/_components/NotifyMeForm'
import PriceDropModal from '@/app/(frontend)/usedcars/[slug]/_components/modals/PriceDropModal'
import WishlistClient from '@/app/(frontend)/wishlist/_components/WishlistClient'
import { WishlistProvider } from '@/contexts/WishlistContext'
import { emptyFilters } from '@/utilities/stockFilters'
import { toggleCompare } from '@/utilities/wishlistVehicle'

let fetchMock: ReturnType<typeof vi.fn>
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_STOCK_ALERTS_ENABLED', 'true')
  vi.stubEnv('DEALER_ID', 'dealer-1')
  vi.stubEnv('EXTERNAL_NOTIFICATIONS_WEBHOOK_SECRET', 'lead-secret')
  vi.stubEnv('FORM_SUBMIT_WEBHOOK_URL', 'https://dms.example.com/enquiries')
  // Only fetch is stubbed: the form, /api/submit-form and the spam guard are the real code
  fetchMock = vi.fn(async (url: string, options: RequestInit) => {
    if (url === '/api/submit-form') {
      return POST(new NextRequest('http://localhost/api/submit-form', { method: options.method, headers: options.headers, body: options.body }))
    }
    return new Response('{}', { status: 200 })
  })
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); localStorage.clear() })

const dmsBody = () => {
  const call = fetchMock.mock.calls.find(([url]) => url === 'https://dms.example.com/enquiries')
  return call ? JSON.parse(call[1].body as string) : null
}
function fill(name = 'Alex Smith', email = 'alex@example.com', phone = '07700900123') {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: name } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Phone (optional)'), { target: { value: phone } })
}

describe('notify me when one arrives (stock list empty state)', () => {
  it('sends a find-your-next-car lead with the current filters', async () => {
    render(React.createElement(NotifyMeForm, { filters: { ...emptyFilters(), make: 'BMW', model: 'X5', maxPrice: '20000' } }))
    expect(screen.getByText("We'll only contact you about this car or similar vehicles.")).toBeDefined()
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'Notify Me' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Alert set'))
    const body = dmsBody()
    expect(body).toMatchObject({
      enquiryType: 'find-your-next-car',
      advertiserId: 'dealer-1',
      personal: { firstName: 'Alex', lastName: 'Smith', email: 'alex@example.com', phoneNumber: '07700900123' },
      vehicle: null,
      findYourNextCar: { enquiryType: 'help-finding-car', vehiclePreferences: 'Make: BMW, Model: X5, Price to £20000' },
      notes: 'Website alert: notify me when a matching car arrives (Make: BMW, Model: X5, Price to £20000)',
      website: '',
    })
  })
  it('rejects a submission with the hidden trap field filled and never reaches the DMS', async () => {
    const { container } = render(React.createElement(NotifyMeForm, { filters: emptyFilters() }))
    fill()
    ;(container.querySelector('input[name="website"]') as HTMLInputElement).value = 'spam'
    fireEvent.click(screen.getByRole('button', { name: 'Notify Me' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Unable to accept this submission'))
    expect(dmsBody()).toBeNull()
  })
  it('asks for name and email before sending', () => {
    render(React.createElement(NotifyMeForm, { filters: emptyFilters() }))
    fill('  ', 'alex@example.com', '')
    fireEvent.click(screen.getByRole('button', { name: 'Notify Me' }))
    expect(screen.getByRole('alert').textContent).toContain('name and email')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('tell me if the price drops (car page)', () => {
  it('sends a lead with the vehicle and the price-drop note', async () => {
    render(React.createElement(PriceDropModal, { vehicleMake: 'BMW', vehicleModel: '320d', vehicleReg: 'AB12 CDE', vehiclePrice: 12995, stockId: 'stock-123', onClose: vi.fn() }))
    expect(screen.getByText("We'll only contact you about this car or similar vehicles.")).toBeDefined()
    fill('Alex', 'alex@example.com', '')
    fireEvent.click(screen.getByRole('button', { name: 'Tell Me If The Price Drops' }))
    await waitFor(() => expect(screen.getByRole('status')).toBeDefined())
    expect(dmsBody()).toMatchObject({
      enquiryType: 'find-your-next-car',
      personal: { firstName: 'Alex', lastName: '', email: 'alex@example.com', phoneNumber: '' },
      vehicle: { stockId: 'stock-123', make: 'BMW', model: '320d', registration: 'AB12 CDE', price: 12995 },
      findYourNextCar: { enquiryType: 'stock-vehicle', vehiclePreferences: 'BMW 320d AB12 CDE' },
      notes: 'Website alert: price drop on AB12 CDE',
    })
  })
  it('shows the route error and keeps the form when delivery fails', async () => {
    vi.stubEnv('FORM_SUBMIT_WEBHOOK_URL', 'https://dms.example.com/enquiries')
    fetchMock.mockImplementation(async (url: string, options: RequestInit) => url === '/api/submit-form'
      ? POST(new NextRequest('http://localhost/api/submit-form', { method: options.method, headers: options.headers, body: options.body }))
      : new Response('{}', { status: 503 }))
    render(React.createElement(PriceDropModal, { vehicleMake: 'BMW', vehicleModel: '320d', vehicleReg: 'AB12 CDE', vehiclePrice: 12995, stockId: 'stock-123', onClose: vi.fn() }))
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'Tell Me If The Price Drops' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Unable to deliver'))
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('alex@example.com')
  })
})

describe('shortlist comparison', () => {
  it('allows up to 3 cars and refuses a 4th', () => {
    let state = { selected: [] as string[], refused: false }
    for (const id of ['a', 'b', 'c']) state = toggleCompare(state.selected, id)
    expect(state).toEqual({ selected: ['a', 'b', 'c'], refused: false })
    expect(toggleCompare(state.selected, 'd')).toEqual({ selected: ['a', 'b', 'c'], refused: true })
    expect(toggleCompare(state.selected, 'b').selected).toEqual(['a', 'c'])
  })
  it('shows ticked saved cars side by side and refuses a 4th tick with a message', async () => {
    const saved = ['a', 'b', 'c', 'd'].map((id, i) => ({
      stockId: id, title: `Car ${id.toUpperCase()}`, price: String(10000 + i), year: '2020', mileage: '30000', fuel: 'Diesel',
      transmission: 'Manual', bodyType: 'SUV', engineSize: '2.0L', colour: 'Black', doors: '5', seats: '7', href: `/usedcars/car-${id}`, image: null,
    }))
    localStorage.setItem('autoprestige-cars-wishlist', JSON.stringify(saved))
    render(React.createElement(WishlistProvider, null, React.createElement(WishlistClient)))
    await waitFor(() => expect(screen.getAllByRole('checkbox')).toHaveLength(4))
    const boxes = screen.getAllByRole('checkbox') as HTMLInputElement[]
    fireEvent.click(boxes[0]); fireEvent.click(boxes[1]); fireEvent.click(boxes[2])
    const table = screen.getByRole('table')
    expect(table.textContent).toContain('Car A')
    expect(table.textContent).toContain('£10,002')
    expect(table.textContent).toContain('2.0L')
    expect(screen.getAllByRole('link', { name: 'View car' }).map((a) => a.getAttribute('href'))).toEqual(['/usedcars/car-a', '/usedcars/car-b', '/usedcars/car-c'])
    fireEvent.click(boxes[3])
    expect(boxes[3].checked).toBe(false)
    expect(screen.getByRole('alert').textContent).toContain('up to 3 cars')
  })
})
