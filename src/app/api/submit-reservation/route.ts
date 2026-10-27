import { reportOperationalError } from '@/utilities/reportOperationalError'
import { guardLead } from '@/utilities/leadSpamGuard'
import { getLeadConfig } from '@/utilities/dmsLead'
import { NextRequest, NextResponse } from 'next/server'
import { VehicleReservationData } from '@/types/webhook'
import { sendVehicleReservationEmail } from '@/utilities/sendEmail'


type WebhookAttemptResult = {
  ok: boolean
  status: number
  errorBody: string | null
}

async function postToWebhook(url: string, payload: unknown): Promise<WebhookAttemptResult> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': getLeadConfig(true).secret,
    },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify(payload),
  })

  if (response.ok) {
    return {
      ok: true,
      status: response.status,
      errorBody: null,
    }
  }

  const errorBody = await response.text().catch(() => null)

  return {
    ok: false,
    status: response.status,
    errorBody,
  }
}

function buildReservationWebhookPayload(data: VehicleReservationData, dealerId: string) {
  return {
    type: 'vehicle-reservation',
    timestamp: new Date().toISOString(),
    data: {
      ...data,
      affiliateId: dealerId,
    },
  }
}

function buildCompatibilityWebhookPayload(data: VehicleReservationData, dealerId: string) {
  return {
    advertiserId: dealerId,
    enquiryType: 'find-your-next-car',
    personal: {
      title: data.customerDetails.title,
      firstName: data.customerDetails.firstName,
      lastName: data.customerDetails.lastName,
      email: data.customerDetails.email,
      phoneNumber: data.customerDetails.phone,
      gender: null,
      countryOfOrigin: null,
      dateOfBirth: null,
      maritalStatus: null,
      dependents: null,
      address: data.customerDetails.address,
    },
    vehicle: {
      stockId: data.vehicleDetails.stockId || null,
      make: data.vehicleDetails.make,
      model: data.vehicleDetails.model,
      registration: data.vehicleDetails.registration,
      mileage: null,
      year: null,
      recentValuations: null,
      price: null,
      initialDeposit: data.amount,
      loanTerm: null,
      apr: null,
      amountToFinance: null,
      monthlyPayment: null,
    },
    userVehicle: null,
    findYourNextCar: {
      enquiryType: 'stock-vehicle',
      vehiclePreferences: `Vehicle reservation request for ${data.vehicleDetails.make} ${data.vehicleDetails.model} (${data.vehicleDetails.registration}).`,
    },
    testDrive: null,
    employment: null,
    finance: null,
    bank: null,
    notes: `Reservation amount: £${(data.amount / 100).toFixed(2)} (in pence: ${data.amount}).`,
    affiliateId: dealerId,
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: VehicleReservationData = await request.json()
    const rejection = await guardLead(request, data)
    if (rejection) return rejection

    // Validate required fields
    if (!data.customerDetails || !data.vehicleDetails) {
      return NextResponse.json(
        { error: 'Missing required customer or vehicle details' },
        { status: 400 }
      )
    }

    // Validate customer details
    const { firstName, lastName, email, phone, address, title } = data.customerDetails
    if (!firstName || !lastName || !email || !phone || !address || !title) {
      return NextResponse.json(
        { error: 'Missing required customer information' },
        { status: 400 }
      )
    }

    // Validate vehicle details
    const { make, model, registration } = data.vehicleDetails
    if (!make || !model || !registration) {
      return NextResponse.json(
        { error: 'Missing required vehicle information' },
        { status: 400 }
      )
    }

    // Validate amount
    if (!data.amount || data.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid reservation amount' },
        { status: 400 }
      )
    }

    const lead = getLeadConfig(true)

    // Send email notification
    const emailResult = await sendVehicleReservationEmail(data)
    
    if (!emailResult.success) {
      console.error('Failed to send vehicle reservation email:', emailResult.error)
      // Don't fail the entire request if email fails
    }

    // Submit to webhook if URL is configured
    const webhookUrl = lead.url
    const dealerId = lead.dealerId
    
    let webhookSuccess = false
    let webhookError: string | null = null

    if (webhookUrl) {
      try {
        const primaryAttempt = await postToWebhook(
          webhookUrl,
          buildReservationWebhookPayload(data, dealerId),
        )

        if (primaryAttempt.ok) {
          webhookSuccess = true
        } else {
          const compatibilityAttempt = await postToWebhook(
            webhookUrl,
            buildCompatibilityWebhookPayload(data, dealerId),
          )

          if (compatibilityAttempt.ok) {
            webhookSuccess = true
          } else {
            const primaryError = primaryAttempt.errorBody ? ` - ${primaryAttempt.errorBody}` : ''
            const compatibilityError = compatibilityAttempt.errorBody
              ? ` - ${compatibilityAttempt.errorBody}`
              : ''

            webhookError =
              `Webhook failed with status ${primaryAttempt.status}${primaryError}. ` +
              `Compatibility retry failed with status ${compatibilityAttempt.status}${compatibilityError}`
          }
        }
      } catch (error) {
        console.error('Error submitting to webhook:', error)
        webhookError = error instanceof Error ? error.message : 'Unknown webhook error'
      }
    }

    if (!webhookSuccess) {
      await reportOperationalError('dms_reservation_delivery_failed')
      return NextResponse.json({ error: 'Unable to deliver your reservation. Please contact the dealership.' }, { status: 502 })
    }
    return NextResponse.json({
      success: true,
      message: 'Vehicle reservation request submitted successfully',
      email: {
        sent: emailResult.success,
        emailId: emailResult.emailId,
        
      },
      webhook: {
        sent: webhookSuccess,
        
      },
    })

  } catch (error) {
    await reportOperationalError('reservation_submission_failed')
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
