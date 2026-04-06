'use client'

import React, { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import type { WebhookData } from '@/types/webhook'

interface ValuationFormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  registration: string
  mileage: string
  make: string
  model: string
  year: string
  recentValuation: string
  interestedMake: string
  interestedModel: string
  message: string
}

const initialState: ValuationFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  registration: '',
  mileage: '',
  make: '',
  model: '',
  year: '',
  recentValuation: '',
  interestedMake: '',
  interestedModel: '',
  message: '',
}

const inputClass =
  'w-full bg-transparent border border-white/20 text-white placeholder-white/35 px-4 py-3 focus:outline-none focus:border-blue-400 !transition-colors text-sm'

const labelClass = 'block text-xs font-semibold tracking-widest text-white/70 uppercase mb-2'

function buildValuationPayload(formData: ValuationFormState): WebhookData {
  const interestedVehicleProvided = Boolean(formData.interestedMake || formData.interestedModel)

  return {
    advertiserId: process.env.NEXT_PUBLIC_DEALER_ID || 'b1cc0a28-8ea3-4964-a6bf-07e2a2677a70',
    enquiryType: 'part-exchange',
    personal: {
      title: null,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phone,
      gender: null,
      countryOfOrigin: null,
      dateOfBirth: null,
      maritalStatus: null,
      dependents: null,
      address: formData.address || null,
    },
    vehicle: interestedVehicleProvided
      ? {
          stockId: null,
          make: formData.interestedMake || null,
          model: formData.interestedModel || null,
          registration: null,
          mileage: null,
          year: null,
          recentValuations: null,
          price: null,
          initialDeposit: null,
          loanTerm: null,
          apr: null,
          amountToFinance: null,
          monthlyPayment: null,
        }
      : null,
    userVehicle: {
      make: formData.make || null,
      model: formData.model || null,
      registration: formData.registration || null,
      mileage: formData.mileage || null,
      year: formData.year || null,
      recentValuations: formData.recentValuation || null,
    },
    findYourNextCar: {
      enquiryType: 'part-exchange',
      vehiclePreferences:
        formData.interestedMake || formData.interestedModel
          ? [formData.interestedMake, formData.interestedModel].filter(Boolean).join(' ')
          : null,
    },
    testDrive: null,
    employment: null,
    finance: null,
    bank: null,
    notes: [
      'Vehicle valuation submitted from valuation page.',
      formData.message ? `Customer Message: ${formData.message}` : '',
    ]
      .filter(Boolean)
      .join(' | '),
  }
}

export default function ValuationForm() {
  const [formData, setFormData] = useState<ValuationFormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    const normalizedValue = name === 'registration' ? value.toUpperCase() : value

    setFormData((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = buildValuationPayload(formData)

      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to submit valuation request. Please try again.')
      }

      setSubmitted(true)
      setFormData(initialState)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 md:py-16">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-black tracking-wider text-white uppercase mb-2">
          Valuation Request Sent
        </h3>
        <p className="text-white/65 max-w-lg mx-auto">
          Thank you. Our team will review your vehicle details and contact you shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-blue-400 hover:text-blue-300 text-sm font-semibold tracking-wider uppercase underline"
        >
          Submit Another Request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-sm font-black tracking-widest uppercase text-white mb-1">Personal Details</h3>
        <div className="h-[2px] w-full bg-blue-500 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              First Name <span className="text-blue-400">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>
              Last Name <span className="text-blue-400">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email Address <span className="text-blue-400">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone Number <span className="text-blue-400">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address" className={labelClass}>Address (Optional)</label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="House number, street, postcode"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black tracking-widest uppercase text-white mb-1">Your Vehicle Details</h3>
        <div className="h-[2px] w-full bg-blue-500 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="registration" className={labelClass}>
              Registration <span className="text-blue-400">*</span>
            </label>
            <input
              id="registration"
              name="registration"
              type="text"
              required
              value={formData.registration}
              onChange={handleChange}
              className={`${inputClass} uppercase`}
              placeholder="AB12 CDE"
            />
          </div>
          <div>
            <label htmlFor="mileage" className={labelClass}>
              Mileage <span className="text-blue-400">*</span>
            </label>
            <input
              id="mileage"
              name="mileage"
              type="number"
              min="0"
              required
              value={formData.mileage}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="make" className={labelClass}>
              Make <span className="text-blue-400">*</span>
            </label>
            <input
              id="make"
              name="make"
              type="text"
              required
              value={formData.make}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="model" className={labelClass}>
              Model <span className="text-blue-400">*</span>
            </label>
            <input
              id="model"
              name="model"
              type="text"
              required
              value={formData.model}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="year" className={labelClass}>Year (Optional)</label>
            <input
              id="year"
              name="year"
              type="number"
              min="1900"
              max="2100"
              value={formData.year}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="recentValuation" className={labelClass}>Recent Valuation (Optional)</label>
            <input
              id="recentValuation"
              name="recentValuation"
              type="number"
              min="0"
              value={formData.recentValuation}
              onChange={handleChange}
              className={inputClass}
              placeholder="Amount in GBP"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black tracking-widest uppercase text-white mb-1">
          Next Vehicle (Optional)
        </h3>
        <div className="h-[2px] w-full bg-blue-500 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="interestedMake" className={labelClass}>Interested Make</label>
            <input
              id="interestedMake"
              name="interestedMake"
              type="text"
              value={formData.interestedMake}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="interestedModel" className={labelClass}>Interested Model</label>
            <input
              id="interestedModel"
              name="interestedModel"
              type="text"
              value={formData.interestedModel}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="message" className={labelClass}>Additional Notes (Optional)</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className={`${inputClass} resize-none`}
              placeholder="Service history, condition notes, preferred contact time, etc."
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-blue-300 text-sm border border-blue-400/30 px-4 py-3">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-white/40 text-xs">* required fields</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black tracking-widest uppercase px-8 py-3 !transition-colors text-sm"
        >
          {isSubmitting ? 'Submitting...' : 'Request Valuation'}
        </button>
      </div>
    </form>
  )
}
