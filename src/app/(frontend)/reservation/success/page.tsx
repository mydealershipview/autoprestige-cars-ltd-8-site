'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { CheckCircle, XCircle, Clock, AlertCircle, Car, Phone, Mail, ArrowLeft } from 'lucide-react'
import { CustomButton } from '@/components/ui/custom-button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface PaymentData {
  paymentStatus: string
  paymentRecord: {
    id: number
    customerDetails: {
      firstName: string
      lastName: string
      email: string
      phone: string
    }
    vehicleDetails: {
      make: string
      model: string
      registration: string
    }
    amount: number
    paidAmount?: number
  }
  paymentData: {
    paidAmount?: string
    statusDetails?: {
      statusUpdateDate?: string
    }
  }
}

export default function ReservationSuccessPage() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  const status = searchParams.get('status')
  const paymentRequestId = searchParams.get('paymenRequestId') // Note: Atoa docs show this typo
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info')
        if (!response.ok) {
          return
        }

        const data = await response.json()
        const primaryPhone =
          data?.phoneNumbers?.find((entry: any) => entry?.isPrimary)?.number ||
          data?.phoneNumbers?.[0]?.number ||
          ''
        const primaryEmail =
          data?.emailAddresses?.find((entry: any) => entry?.isPrimary)?.email ||
          data?.emailAddresses?.[0]?.email ||
          ''

        setContactPhone(primaryPhone)
        setContactEmail(primaryEmail)
      } catch {
        // keep fallback contact values
      }
    }

    const fetchPaymentStatus = async () => {
      if (!paymentRequestId) {
        setError('No payment request ID found')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/payments/status?paymentRequestId=${paymentRequestId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch payment status')
        }

        const data = await response.json()

        if (data.success) {
          setPaymentData(data)
        } else {
          setError(data.error || 'Unknown error occurred')
        }
      } catch (err) {
        console.error('Error fetching payment status:', err)
        setError('Failed to load payment details')
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentStatus()
    fetchContactInfo()

    // If status is PENDING, poll for updates
    if (status === 'PENDING') {
      const interval = setInterval(fetchPaymentStatus, 5000) // Poll every 5 seconds
      return () => clearInterval(interval)
    }
  }, [paymentRequestId, status])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-16 h-16 text-green-600" />
      case 'FAILED':
        return <XCircle className="w-16 h-16 text-red-600" />
      case 'PENDING':
        return <Clock className="w-16 h-16 text-yellow-600 animate-pulse" />
      case 'EXPIRED':
        return <AlertCircle className="w-16 h-16 text-orange-600" />
      default:
        return <AlertCircle className="w-16 h-16 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600'
      case 'FAILED':
        return 'text-red-600'
      case 'PENDING':
        return 'text-yellow-600'
      case 'EXPIRED':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          title: 'Reservation Confirmed!',
          message: 'Your vehicle reservation has been successfully processed. We will contact you shortly to confirm availability and next steps.',
        }
      case 'FAILED':
        return {
          title: 'Payment Failed',
          message: 'Unfortunately, your payment could not be processed. Please try again or contact us for assistance.',
        }
      case 'PENDING':
        return {
          title: 'Payment Processing',
          message: 'Your payment is currently being processed. This usually takes 2-3 minutes. Please wait while we confirm your reservation.',
        }
      case 'EXPIRED':
        return {
          title: 'Payment Expired',
          message: 'The payment session has expired. Please start a new reservation if you still wish to reserve this vehicle.',
        }
      default:
        return {
          title: 'Unknown Status',
          message: 'We are checking the status of your payment. Please contact us if you need assistance.',
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Payment Details</h2>
            <p className="text-gray-600">Please wait while we retrieve your reservation status...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl p-8">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error || 'Unable to load payment details'}</p>
            <Link href="/">
              <CustomButton variant="primary" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </CustomButton>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const { paymentStatus } = paymentData
  const statusInfo = getStatusMessage(paymentStatus)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6">
              <div className="text-center text-white">
                <h1 className="text-2xl font-bold mb-2">Vehicle Reservation</h1>
                <p className="text-slate-200">Status Update</p>
              </div>
            </div>

            {/* Status Section */}
            <div className="p-8">
              <div className="text-center mb-8">
                {getStatusIcon(paymentStatus)}
                <h2 className={`text-2xl font-bold mt-4 mb-2 ${getStatusColor(paymentStatus)}`}>
                  {statusInfo.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {statusInfo.message}
                </p>
              </div>

              {/* Vehicle Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Vehicle Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Make</span>
                    <p className="font-medium">{paymentData.paymentRecord.vehicleDetails.make}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Model</span>
                    <p className="font-medium">{paymentData.paymentRecord.vehicleDetails.model}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Registration</span>
                    <p className="font-medium">{paymentData.paymentRecord.vehicleDetails.registration}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Reservation Amount</span>
                    <p className="text-xl font-bold text-blue-700">
                      £{(paymentData.paymentRecord.amount / 100).toFixed(2)}
                    </p>
                  </div>
                  {paymentData.paymentData.paidAmount && (
                    <div>
                      <span className="text-sm text-gray-600">Amount Paid</span>
                      <p className="text-xl font-bold text-green-700">
                        £{(parseInt(paymentData.paymentData.paidAmount) / 100).toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600">Status</span>
                    <p className={`font-semibold ${getStatusColor(paymentStatus)}`}>
                      {paymentStatus}
                    </p>
                  </div>
                  {orderId && (
                    <div>
                      <span className="text-sm text-gray-600">Order ID</span>
                      <p className="font-mono text-sm">{orderId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Name</span>
                    <p className="font-medium">
                      {paymentData.paymentRecord.customerDetails.firstName} {paymentData.paymentRecord.customerDetails.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email</span>
                    <p className="font-medium">{paymentData.paymentRecord.customerDetails.email}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {paymentStatus === 'COMPLETED' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <p className="text-green-800 text-sm font-medium text-center">
                      We will contact you within 24 hours to confirm vehicle availability and arrange viewing/collection.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomButton
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`tel:${(contactPhone || '01234567890').replace(/\s+/g, '')}`)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Us
                  </CustomButton>
                  <CustomButton
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`mailto:${contactEmail || 'info@dealership.co.uk'}`)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                  </CustomButton>
                </div>

                <Link href="/">
                  <CustomButton variant="primary" gradient className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Browse More Vehicles
                  </CustomButton>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
