import React from 'react'
import { Mail } from 'lucide-react'

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
  emailAddress,
  onClose,
}: EmailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-sm bg-[#161616] border border-white/10 p-6 shadow-2xl text-center">
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-5 h-5 text-white" />
        </div>

        <h2 className="text-xl font-light tracking-widest uppercase mb-2">Email Dealership</h2>
        <p className="text-sm text-zinc-400 mb-4">
          If you want to contact the dealer, write an email on this address:
        </p>

        <a
          href={`mailto:${emailAddress}`}
          className="block text-lg font-medium tracking-wide mb-8 text-zinc-200 hover:text-white !transition-colors"
        >
          {emailAddress}
        </a>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="w-full border border-white/30 text-white px-4 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-white/10 !transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
