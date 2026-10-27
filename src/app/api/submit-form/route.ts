import { getLeadConfig } from '@/utilities/dmsLead'
import { NextRequest, NextResponse } from 'next/server'
import { sendEnquiryEmail } from '@/utilities/sendEmail'
import { WebhookData } from '@/types/webhook'

export async function POST(request: NextRequest) {
  try {
    const webhookData: WebhookData = await request.json()
    
    // Validate the webhook data
    if (!webhookData.personal?.email || !webhookData.personal?.firstName) {
      return NextResponse.json(
        { error: 'Missing required personal information' },
        { status: 400 }
      )
    }

    const lead = getLeadConfig()
    let webhookSuccess = false
    let emailSuccess = false
    let webhookError = null
    let emailError = null

    // First, send data to the external webhook
    try {
      const webhookUrl = lead.url
      if (webhookUrl) {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': lead.secret,
          },
          signal: AbortSignal.timeout(15_000),
          body: JSON.stringify({
            ...webhookData,
            affiliateId: lead.dealerId,
            advertiserId: lead.dealerId,
          }),
        })

        if (webhookResponse.ok) {
          webhookSuccess = true
        } else {
          webhookError = `Webhook failed with status: ${webhookResponse.status}`
        }
      } else {
        webhookError = 'Webhook URL not configured'
      }
    } catch (error) {
      webhookError = error instanceof Error ? error.message : 'Webhook request failed'
      console.error('Webhook error:', error)
    }

    // Send email notification (independent of webhook success)
    try {
      const emailResult = await sendEnquiryEmail(webhookData)
      emailSuccess = emailResult.success
      if (!emailResult.success) {
        emailError = emailResult.error
      }
    } catch (error) {
      emailError = error instanceof Error ? error.message : 'Email sending failed'
      console.error('Email error:', error)
    }

    if (!webhookSuccess) console.error("DMS enquiry delivery failed", { reason: webhookError })

    // Return response based on results
    if (webhookSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Form submitted successfully',
        details: {
          webhook: webhookSuccess ? 'success' : 'failed',
          email: emailSuccess ? 'success' : 'failed',

        }
      })
    } else {
      return NextResponse.json(
        {
          error: 'Unable to deliver your enquiry. Please contact the dealership.',
          details: {

          }
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in form submission API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
