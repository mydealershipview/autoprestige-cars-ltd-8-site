'use client'

import React from 'react'
import StockAlertForm from './StockAlertForm'
import { buildPriceDropPayload } from './formSubmission'

interface PriceDropModalProps {
  vehicleMake: string
  vehicleModel: string
  vehicleReg: string
  vehiclePrice: number | null
  stockId?: string
  onClose: () => void
}

/** "Tell me if the price drops" (Upgrade Spec 7): a DMS lead for this car. Not offered on sold cars. */
export default function PriceDropModal({ vehicleMake, vehicleModel, vehicleReg, vehiclePrice, stockId, onClose }: PriceDropModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8">
      <div role="dialog" aria-modal="true" aria-labelledby="price-drop-title" className="w-full max-w-2xl bg-[#161616] border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col max-h-full">
        <div className="flex justify-between items-center gap-4 mb-6 shrink-0">
          <h2 id="price-drop-title" className="text-xl font-light tracking-widest uppercase">Price Drop Alert</h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white text-sm uppercase tracking-widest !transition-colors">
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
          <p className="mb-6 text-sm text-zinc-400">We&apos;ll let you know if the price of this car drops.</p>
          <StockAlertForm
            idPrefix="price-drop"
            submitLabel="Tell Me If The Price Drops"
            successText="Thank you. We'll let you know if the price of this car drops."
            buildPayload={(contact) =>
              buildPriceDropPayload(contact, { stockId, make: vehicleMake, model: vehicleModel, registration: vehicleReg, price: vehiclePrice })
            }
          />
        </div>
      </div>
    </div>
  )
}
