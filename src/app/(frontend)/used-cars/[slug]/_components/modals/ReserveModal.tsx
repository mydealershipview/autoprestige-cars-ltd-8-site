import React, { useState } from 'react'
import { buildReservationPayload, submitReservationForm } from './formSubmission'

interface ReserveModalProps {
  vehicleMake: string
  vehicleModel: string
  vehicleReg: string
  vehiclePrice: number | null
  stockId?: string
  onClose: () => void
}

export default function ReserveModal({
  vehicleMake,
  vehicleModel,
  vehicleReg,
  vehiclePrice,
  stockId,
  onClose,
}: ReserveModalProps) {
  const [title, setTitle] = useState('Mr')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const reservationAmountPence = 9900

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const payload = buildReservationPayload({
        title,
        firstName,
        lastName,
        email,
        phone,
        address,
        amountPence: reservationAmountPence,
        vehicleMake,
        vehicleModel,
        vehicleRegistration: vehicleReg || 'UNKNOWN',
        stockId,
      })

      await submitReservationForm(payload)
      onClose()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit reservation')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-lg bg-[#161616] border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-dvh">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light tracking-widest uppercase">Reserve Vehicle</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm uppercase tracking-widest !transition-colors">
            Close
          </button>
        </div>
        
        <div className="mb-6 p-4 bg-zinc-900 border border-white/5">
          <p className="text-sm text-zinc-400 uppercase tracking-widest mb-1">Reserving</p>
          <p className="text-lg font-medium">{vehicleMake} {vehicleModel}</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase">Reg: {vehicleReg || 'N/A'}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Title</label>
            <select value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30">
              <option>Mr</option>
              <option>Mrs</option>
              <option>Miss</option>
              <option>Ms</option>
              <option>Dr</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">First Name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" required className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Last Name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" required className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" required className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30"></textarea>
          </div>

          <div className="text-xs text-zinc-500 border border-white/10 bg-zinc-900/60 p-3">
            Reservation amount: £{(reservationAmountPence / 100).toFixed(2)}
            {vehiclePrice ? ` • Vehicle price: £${new Intl.NumberFormat('en-GB').format(vehiclePrice)}` : ''}
          </div>

          {submitError && (
            <p className="text-sm text-red-400">{submitError}</p>
          )}

          <div className="flex items-start gap-3 mt-6">
            <input type="checkbox" id="reserve-terms" required className="mt-1" />
            <label htmlFor="reserve-terms" className="text-xs text-zinc-400 leading-relaxed">
              I agree to the terms and conditions and privacy policy. I understand that a reservation fee may be required.
            </label>
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full bg-white text-black px-4 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-zinc-200 !transition-colors mt-6 disabled:opacity-60 disabled:cursor-not-allowed">
            {isSubmitting ? 'Submitting...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  )
}
