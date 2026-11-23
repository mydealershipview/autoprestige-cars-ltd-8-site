'use client'

import { FormHoneypot, honeypotValue } from '@/components/FormHoneypot'
import type { WebhookData } from '@/types/webhook'
import React, { useState } from 'react'
import { submitWebhookForm } from './formSubmission'
import { STOCK_ALERT_CONSENT } from '@/utilities/stockAlerts'

interface StockAlertFormProps {
  /** Builds the DMS lead from the visitor's details. */
  buildPayload: (contact: { fullName: string; email: string; phone: string }) => WebhookData
  submitLabel: string
  successText: string
  idPrefix: string
}

/** Short alert sign-up (name, email, optional phone) sent as a DMS lead; same route and spam trap as the enquiry forms. */
export default function StockAlertForm({ buildPayload, submitLabel, successText, idPrefix }: StockAlertFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const website = honeypotValue(event.currentTarget as HTMLFormElement)
    if (isSubmitting) return
    setSubmitError(null)
    if (!fullName.trim() || !email.trim()) {
      setSubmitError('Please enter your name and email.')
      return
    }
    setIsSubmitting(true)
    try {
      await submitWebhookForm({ ...buildPayload({ fullName, email, phone }), website })
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to set up your alert. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClassName = 'w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30'
  const labelClassName = 'block text-xs uppercase tracking-widest text-zinc-400 mb-2'

  if (submitted) {
    return (
      <div role="status" className="space-y-2 text-left">
        <h3 className="text-lg font-medium text-white">Alert set</h3>
        <p className="text-sm text-zinc-400">{successText}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left" aria-busy={isSubmitting}>
      <FormHoneypot />
      <fieldset disabled={isSubmitting} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor={`${idPrefix}-name`} className={labelClassName}>Name</label>
          <input id={`${idPrefix}-name`} name="fullName" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} type="text" required className={inputClassName} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-email`} className={labelClassName}>Email</label>
          <input id={`${idPrefix}-email`} name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className={inputClassName} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-phone`} className={labelClassName}>Phone (optional)</label>
          <input id={`${idPrefix}-phone`} name="phone" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" className={inputClassName} />
        </div>
      </fieldset>
      {submitError && <p role="alert" className="text-sm text-blue-300">{submitError}</p>}
      <p className="text-xs text-zinc-500">{STOCK_ALERT_CONSENT}</p>
      <button disabled={isSubmitting} type="submit" className="w-full bg-white text-black px-4 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-zinc-200 !transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
        {isSubmitting ? 'Sending...' : submitLabel}
      </button>
    </form>
  )
}
