import { guardLead } from '@/utilities/leadSpamGuard'
import { NextRequest, NextResponse } from 'next/server'
import { sendEnquiryEmail } from '@/utilities/sendEmail'
import { WebhookData } from '@/types/webhook'

export async function POST(request: NextRequest) {
  try {
    const webhookData: WebhookData = await request.json()
    const rejection = await guardLead(request, webhookData)
    if (rejection) return rejection
    
    // Validate the webhook data
    if (!webhookData.personal?.email || !webhookData.personal?.firstName) {
      return NextResponse.json(
        { error: 'Missing required personal information' },
        { status: 400 }
      )
    }

    let webhookSuccess = false
    let emailSuccess = false
    let webhookError = null
    let emailError = null

    // First, send data to the external webhook
    try {
      const webhookUrl = process.env.FORM_SUBMIT_WEBHOOK_URL
      if (webhookUrl) {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...webhookData,
            affiliateId: process.env.DEALER_ID || "b1cc0a28-8ea3-4964-a6bf-07e2a2677a70",
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

    // Return response based on results
    if (webhookSuccess || emailSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Form submitted successfully',
        details: {
          webhook: webhookSuccess ? 'success' : 'failed',
          email: emailSuccess ? 'success' : 'failed',
          webhookError,
          emailError
        }
      })
    } else {
      return NextResponse.json(
        {
          error: 'Both webhook and email failed',
          details: {
            webhookError,
            emailError
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
