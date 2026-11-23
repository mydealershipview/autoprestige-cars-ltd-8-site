'use client'

import React from 'react'
import StockAlertForm from '../[slug]/_components/modals/StockAlertForm'
import { buildNotifyMePayload } from '../[slug]/_components/modals/formSubmission'
import { describeFilters, type ListingsFilters } from '@/utilities/stockFilters'

/** Stock list empty state (Upgrade Spec 4 + 7): "notify me when one arrives", sent to the DMS as a lead. */
export default function NotifyMeForm({ filters }: { filters: ListingsFilters }) {
  const summary = describeFilters(filters)
  return (
    <section aria-labelledby="notify-me-title" className="mt-10 w-full max-w-2xl border border-white/10 bg-[#161616] p-6 md:p-8">
      <h2 id="notify-me-title" className="text-xl font-light tracking-widest uppercase text-white">Notify me when one arrives</h2>
      <p className="mt-2 mb-6 text-sm text-zinc-400">
        Leave your details and we&apos;ll let you know when a car matching your search comes into stock ({summary}).
      </p>
      <StockAlertForm
        idPrefix="notify-me"
        submitLabel="Notify Me"
        successText="Thank you. We'll be in touch when a matching car arrives."
        buildPayload={(contact) => buildNotifyMePayload(contact, summary)}
      />
    </section>
  )
}
