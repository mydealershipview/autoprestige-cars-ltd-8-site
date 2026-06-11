import { WebhookData, VehicleReservationData } from '@/types/webhook'

const DEFAULT_DEALER_ID = 'b1cc0a28-8ea3-4964-a6bf-07e2a2677a70'

function getDealerId(): string {
  return process.env.NEXT_PUBLIC_DEALER_ID || DEFAULT_DEALER_ID
}

type EnquiryType = WebhookData['enquiryType']

interface BuildBaseWebhookPayloadArgs {
  enquiryType: EnquiryType
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  title?: string | null
  address?: string | null
}

interface VehicleInfo {
  stockId?: string | null
  make?: string | null
  model?: string | null
  registration?: string | null
  mileage?: string | null
  year?: string | null
  price?: number | null
}

export function buildBaseWebhookPayload(args: BuildBaseWebhookPayloadArgs): WebhookData {
  return {
    advertiserId: getDealerId(),
    enquiryType: args.enquiryType,
    personal: {
      title: args.title ?? null,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phoneNumber: args.phoneNumber,
      gender: null,
      countryOfOrigin: null,
      dateOfBirth: null,
      maritalStatus: null,
      dependents: null,
      address: args.address ?? null,
    },
    vehicle: null,
    userVehicle: null,
    findYourNextCar: null,
    testDrive: null,
    employment: null,
    finance: null,
    bank: null,
    notes: null,
  }
}

export function withInterestedVehicle(payload: WebhookData, vehicle: VehicleInfo): WebhookData {
  return {
    ...payload,
    vehicle: {
      stockId: vehicle.stockId ?? null,
      make: vehicle.make ?? null,
      model: vehicle.model ?? null,
      registration: vehicle.registration ?? null,
      mileage: vehicle.mileage ?? null,
      year: vehicle.year ?? null,
      recentValuations: null,
      price: vehicle.price ?? null,
      initialDeposit: null,
      loanTerm: null,
      apr: null,
      amountToFinance: null,
      monthlyPayment: null,
    },
  }
}

export async function submitWebhookForm(payload: WebhookData): Promise<void> {
  const response = await fetch('/api/submit-form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData?.error || 'Failed to submit form')
  }
}

export async function submitReservationForm(payload: VehicleReservationData): Promise<void> {
  const response = await fetch('/api/submit-reservation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData?.error || 'Failed to submit reservation')
  }
}

export function buildReservationPayload(args: {
  title: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  amountPence: number
  vehicleMake: string
  vehicleModel: string
  vehicleRegistration: string
  stockId?: string
}): VehicleReservationData {
  return {
    customerDetails: {
      title: args.title,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      address: args.address,
    },
    vehicleDetails: {
      make: args.vehicleMake,
      model: args.vehicleModel,
      registration: args.vehicleRegistration,
      stockId: args.stockId,
    },
    amount: args.amountPence,
  }
}
