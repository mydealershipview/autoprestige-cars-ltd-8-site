import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import EmailModal from '@/app/(frontend)/usedcars/[slug]/_components/modals/EmailModal'
import { POST } from '@/app/api/submit-form/route'

vi.mock('@/utilities/sendEmail', () => ({
  sendEnquiryEmail: vi.fn().mockResolvedValue({ success: true }),
}))
vi.mock('@/lib/analytics', () => ({ trackLead: vi.fn(), trackEvent: vi.fn() }))

const vehicle = {
  emailAddress: 'dealer@example.com',
  vehicleMake: 'BMW',
  vehicleModel: '320d',
  vehicleReg: 'AB12 CDE',
  vehiclePrice: 12995,
  stockId: 'stock-123',
}

function fillForm() {
  for (const [label, value] of Object.entries({
    'First name': ' Alex ',
    'Last name': ' Smith ',
    Email: 'alex@example.com',
    Phone: ' 07700900123 ',
    Message: ' Is this vehicle available to view on Saturday? ',
  })) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } })
  }
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('Vehicle enquiry', () => {
  it('forwards customer, message and stock details through the API using the existing DMS contract', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEALER_ID', 'advertiser-123')
    vi.stubEnv('DEALER_ID', 'affiliate-123')
    vi.stubEnv('FORM_SUBMIT_WEBHOOK_URL', 'https://dms.example.com/enquiries')

    const fetchMock = vi.fn(async (url: string, options: RequestInit) => {
      if (url === '/api/submit-form') {
        return POST(new NextRequest('http://localhost/api/submit-form', {
          method: options.method,
          headers: options.headers,
          body: options.body,
        }))
      }
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const onClose = vi.fn()
    render(React.createElement(EmailModal, { ...vehicle, onClose }))
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: 'Send Enquiry' }))

    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Enquiry sent'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [url, options] = fetchMock.mock.calls[1]
    expect(url).toBe('https://dms.example.com/enquiries')
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(JSON.parse(options.body as string)).toEqual({
      advertiserId: 'advertiser-123',
      affiliateId: 'affiliate-123',
      enquiryType: 'general-contact',
      personal: {
        title: null,
        firstName: 'Alex',
        lastName: 'Smith',
        email: 'alex@example.com',
        phoneNumber: '07700900123',
        gender: null,
        countryOfOrigin: null,
        dateOfBirth: null,
        maritalStatus: null,
        dependents: null,
        address: null,
      },
      vehicle: {
        stockId: 'stock-123',
        make: 'BMW',
        model: '320d',
        registration: 'AB12 CDE',
        price: 12995,
        mileage: null,
        year: null,
        recentValuations: null,
        initialDeposit: null,
        loanTerm: null,
        apr: null,
        amountToFinance: null,
        monthlyPayment: null,
      },
      userVehicle: null,
      findYourNextCar: null,
      testDrive: null,
      employment: null,
      finance: null,
      bank: null,
      notes: 'Is this vehicle available to view on Saturday?',
    })
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0])
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('retains the enquiry on failure and allows retry with missing optional stock information', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Please try again.' }), { status: 500 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    render(React.createElement(EmailModal, { ...vehicle, stockId: undefined, vehiclePrice: null, onClose: vi.fn() }))
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: 'Send Enquiry' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Please try again.'))
    expect((screen.getByLabelText('Message') as HTMLTextAreaElement).value).toContain('Saturday')
    expect(screen.getByText('Price on application')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Send Enquiry' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Enquiry sent'))
    const payload = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(payload.vehicle.stockId).toBeNull()
    expect(payload.vehicle.price).toBeNull()
  })

  it('prevents duplicate submissions while a request is pending', async () => {
    let resolveRequest!: (response: Response) => void
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { resolveRequest = resolve }))
    vi.stubGlobal('fetch', fetchMock)
    render(React.createElement(EmailModal, { ...vehicle, onClose: vi.fn() }))
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: 'Send Enquiry' }))
    const sendingButton = screen.getByRole('button', { name: 'Sending...' }) as HTMLButtonElement
    expect(sendingButton.disabled).toBe(true)
    expect((screen.getByLabelText('Email') as HTMLInputElement).closest('fieldset')?.disabled).toBe(true)
    fireEvent.click(sendingButton)
    expect(fetchMock).toHaveBeenCalledOnce()
    resolveRequest(new Response('{}', { status: 200 }))
    await waitFor(() => expect(screen.getByRole('status')).toBeDefined())
  })

  it('rejects whitespace-only required details before making a request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(React.createElement(EmailModal, { ...vehicle, onClose: vi.fn() }))
    fillForm()
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send Enquiry' }))
    expect(screen.getByRole('alert').textContent).toContain('required fields')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
