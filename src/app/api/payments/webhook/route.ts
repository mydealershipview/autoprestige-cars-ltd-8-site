import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import crypto from 'crypto'

// Function to verify Atoa webhook signature
function verifySignature(data: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(data)
    const calculatedSignature = hmac.digest('hex')
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false
    return crypto.timingSafeEqual(Buffer.from(calculatedSignature, 'hex'), Buffer.from(signature, 'hex'))
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    // Get signature from headers
    const signature = req.headers.get('atoa-signature') || req.headers.get('x-atoa-signature')
    
    // Verify signature if we have an Atoa webhook secret
    if (!process.env.ATOA_WEBHOOK_SECRET) return NextResponse.json({ error: 'Payment webhook unavailable' }, { status: 503 })
    if (!signature) return NextResponse.json({ error: 'Signature required' }, { status: 401 })
    {
      const isValidSignature = verifySignature(body, signature, process.env.ATOA_WEBHOOK_SECRET)
      if (!isValidSignature) {
        console.error('Invalid webhook signature')
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    let webhookData
    try { webhookData = JSON.parse(body) } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    const payload = await getPayloadHMR({ config })

    const { paymentRequestId, status, statusDetails, paidAmount, tipAmount, orderId, paymentIdempotencyId, signatureHash, errorDescription } = webhookData

    if (!paymentRequestId) {
      return NextResponse.json(
        { success: false, error: 'No payment request ID provided' },
        { status: 400 }
      )
    }

    // Find the payment record
    const existingPayment = await payload.find({
      collection: 'payments',
      where: {
        'atoaPaymentDetails.paymentRequestId': {
          equals: paymentRequestId,
        },
      },
      limit: 1,
    })

    if (existingPayment.docs.length === 0) {
      console.error('Payment record not found for:', paymentRequestId)
      return NextResponse.json(
        { success: false, error: 'Payment record not found' },
        { status: 404 }
      )
    }

    const paymentRecord = existingPayment.docs[0]

    // Update the payment record with webhook data
    await payload.update({
      collection: 'payments',
      id: paymentRecord.id,
      data: {
        paymentStatus: status,
        statusDetails: {
          statusUpdateDate: statusDetails?.statusUpdateDate || new Date().toISOString(),
          isoStatus: statusDetails?.isoStatus || null,
          errorDescription: errorDescription || null,
        },
        paidAmount: paidAmount ? parseInt(paidAmount) : null,
        tipAmount: tipAmount ? Math.round(parseFloat(tipAmount) * 100) : null,
        signatureHash: signatureHash || null,
        atoaPaymentDetails: {
          ...paymentRecord.atoaPaymentDetails,
          paymentIdempotencyId: paymentIdempotencyId || paymentRecord.atoaPaymentDetails?.paymentIdempotencyId,
        },
      },
    })

    

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
