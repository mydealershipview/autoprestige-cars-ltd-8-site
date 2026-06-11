import React, { useState } from 'react'
import { buildBaseWebhookPayload, submitWebhookForm, withInterestedVehicle } from './formSubmission'

interface PartExchangeModalProps {
  vehicleMake: string
  vehicleModel: string
  vehicleReg: string
  vehiclePrice: number | null
  stockId?: string
  onClose: () => void
}

export default function PartExchangeModal({
  vehicleMake,
  vehicleModel,
  vehiclePrice,
  vehicleReg,
  stockId,
  onClose,
}: PartExchangeModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [userRegistration, setUserRegistration] = useState('')
  const [userMileage, setUserMileage] = useState('')
  const [userMake, setUserMake] = useState('')
  const [userModel, setUserModel] = useState('')
  const [recentValuation, setRecentValuation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const basePayload = buildBaseWebhookPayload({
        enquiryType: 'part-exchange',
        firstName,
        lastName,
        email,
        phoneNumber: phone,
      })

      const payload = withInterestedVehicle(basePayload, {
        stockId,
        make: vehicleMake,
        model: vehicleModel,
        registration: vehicleReg,
        price: vehiclePrice,
      })

      payload.userVehicle = {
        make: userMake || null,
        model: userModel || null,
        registration: userRegistration || null,
        mileage: userMileage || null,
        year: null,
        recentValuations: recentValuation || null,
      }

      payload.notes = 'Part exchange enquiry submitted from vehicle detail page.'

      await submitWebhookForm(payload)
      onClose()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit part exchange request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8">
      <div className="w-full max-w-2xl bg-[#161616] border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col max-h-full">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-light tracking-widest uppercase">Part Exchange Valuation</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm uppercase tracking-widest !transition-colors">
            Close
          </button>
        </div>

        <div className="overflow-y-auto hide-scrollbar pr-2 flex-1">
          <div className="mb-8 p-4 bg-zinc-900 border border-white/5">
            <p className="text-sm text-zinc-400 uppercase tracking-widest mb-1">Interested in</p>
            <p className="text-lg font-medium">{vehicleMake} {vehicleModel}</p>
            <p className="text-sm text-zinc-400 mt-1">Price: £{vehiclePrice ? new Intl.NumberFormat('en-GB').format(vehiclePrice) : 'POA'}</p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-widest text-white border-b border-white/10 pb-2">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">First Name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" required className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Last Name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" required className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" required className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30" />
                </div>
              </div>
            </div>

            {/* Exchange Vehicle Details */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-widest text-white border-b border-white/10 pb-2">Your Vehicle Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Registration</label>
                  <input value={userRegistration} onChange={(e) => setUserRegistration(e.target.value)} type="text" required className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30 uppercase" placeholder="e.g. AB12 CDE" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Current Mileage</label>
                  <input value={userMileage} onChange={(e) => setUserMileage(e.target.value)} type="number" required className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Make</label>
                  <input value={userMake} onChange={(e) => setUserMake(e.target.value)} type="text" required className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Model</label>
                  <input value={userModel} onChange={(e) => setUserModel(e.target.value)} type="text" required className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30" />
                </div>
              </div>
            </div>

            {/* Existing Valuation */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-widest text-white border-b border-white/10 pb-2">Recent Valuation (Optional)</h3>
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Have you had a valuation recently? (£)</label>
                <input value={recentValuation} onChange={(e) => setRecentValuation(e.target.value)} type="number" className="w-full bg-zinc-900 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white/30" placeholder="e.g. 5000" />
              </div>
            </div>

            {submitError && <p className="text-sm text-blue-300">{submitError}</p>}

            <button disabled={isSubmitting} type="submit" className="w-full bg-white text-black px-4 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-zinc-200 !transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
