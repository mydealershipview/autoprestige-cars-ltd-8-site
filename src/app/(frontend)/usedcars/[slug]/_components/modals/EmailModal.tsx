'use client'

import React, { useState } from 'react'
import { buildBaseWebhookPayload, submitWebhookForm, withInterestedVehicle } from './formSubmission'

interface EmailModalProps {
  emailAddress: string
  vehicleMake: string
  vehicleModel: string
  vehicleReg: string
  vehiclePrice: number | null
  stockId?: string
  onClose: () => void
}

export default function EmailModal({
  vehicleMake,
  vehicleModel,
  vehicleReg,
  vehiclePrice,
  stockId,
  onClose,
}: EmailModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setSubmitError(null)

    if (![firstName, lastName, email, phone, message].every((value) => value.trim())) {
      setSubmitError('Please complete all required fields.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = withInterestedVehicle(
        buildBaseWebhookPayload({
          enquiryType: 'general-contact',
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phoneNumber: phone.trim(),
        }),
        {
          stockId,
          make: vehicleMake,
          model: vehicleModel,
          registration: vehicleReg,
          price: vehiclePrice,
        },
      )
      payload.notes = message.trim()

      await submitWebhookForm(payload)
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to send enquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClassName = 'w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30'
  const labelClassName = 'block text-xs uppercase tracking-widest text-zinc-400 mb-2'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8">
      <div role="dialog" aria-modal="true" aria-labelledby="vehicle-enquiry-title" className="w-full max-w-2xl bg-[#161616] border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col max-h-full">
        <div className="flex justify-between items-center gap-4 mb-6 shrink-0">
          <h2 id="vehicle-enquiry-title" className="text-xl font-light tracking-widest uppercase">Enquire About This Vehicle</h2>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="text-zinc-400 hover:text-white text-sm uppercase tracking-widest !transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            Close
          </button>
        </div>

        <div className="overflow-y-auto hide-scrollbar flex-1 min-h-0">
          <div className="mb-6 pb-4 border-b border-white/10">
            <p className="text-lg font-medium text-white">{vehicleMake} {vehicleModel}</p>
            <p className="text-sm text-zinc-400 mt-1">
              {vehiclePrice === null ? 'Price on application' : `£${new Intl.NumberFormat('en-GB').format(vehiclePrice)}`}
            </p>
          </div>

          {submitted ? (
            <div role="status" className="space-y-4">
              <h3 className="text-lg font-medium text-white">Enquiry sent</h3>
              <p className="text-sm text-zinc-400">Thank you for getting in touch. Our team will get back to you shortly.</p>
              <button type="button" onClick={onClose} className="w-full border border-white/30 text-white px-4 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-white/10 !transition-colors">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isSubmitting}>
              <p className="text-sm text-zinc-400">Send your question to our team. All fields are required.</p>
              <fieldset disabled={isSubmitting} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="enquiry-first-name" className={labelClassName}>First name</label>
                  <input id="enquiry-first-name" name="firstName" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} type="text" required className={inputClassName} />
                </div>
                <div>
                  <label htmlFor="enquiry-last-name" className={labelClassName}>Last name</label>
                  <input id="enquiry-last-name" name="lastName" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} type="text" required className={inputClassName} />
                </div>
                <div>
                  <label htmlFor="enquiry-email" className={labelClassName}>Email</label>
                  <input id="enquiry-email" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className={inputClassName} />
                </div>
                <div>
                  <label htmlFor="enquiry-phone" className={labelClassName}>Phone</label>
                  <input id="enquiry-phone" name="phone" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" required className={inputClassName} />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="enquiry-message" className={labelClassName}>Message</label>
                  <textarea id="enquiry-message" name="message" value={message} onChange={(event) => setMessage(event.target.value)} rows={4} required className={`${inputClassName} resize-y`} />
                </div>
              </fieldset>

              {submitError && <p role="alert" className="text-sm text-blue-300">{submitError}</p>}

              <button disabled={isSubmitting} type="submit" className="w-full bg-white text-black px-4 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-zinc-200 !transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {isSubmitting ? 'Sending...' : 'Send Enquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
