'use client'

import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const FinanceApplicationForm = () => {
  const searchParams = useSearchParams()

  const price = searchParams.get('price')
  const mileage = searchParams.get('mileage')
  const imageUrl = searchParams.get('imageUrl')
  const registration = searchParams.get('registration')
  const firstRegistrationDate = searchParams.get('firstRegistrationDate')
  const stockId = searchParams.get('stockId')

  const hasVehicleData = !!(price || registration)
  const priceNum = price ? parseFloat(price) : null
  const mileageNum = mileage ? parseInt(mileage, 10) : null

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const formatMileage = (miles: number) =>
    `${new Intl.NumberFormat('en-GB').format(miles)} mi`

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://plugins.codeweavers.app/scripts/v1/platform/finance?ApiKey=U86tH2vLnYI0LyA2D5'
    script.async = true
    document.head.appendChild(script)

    const loadPlugin = () => {
      if ((window as any).codeweavers) {
        ;(window as any).codeweavers.main({
          pluginContentDivId: 'cw-finance-plugin',
          vehicle: {
            type: 'Car',
            cashPrice: price || '0',
            mileage: mileage || '0',
            isNew: 'false',
            identifierType: '',
            identifier: ' ',
            imageUrl: imageUrl || '',
            linkBackUrl: 'https://www.autoprestigecars.co.uk/',
            registration: {
              number: registration || 'NOVEHICLE',
              date: firstRegistrationDate || '2000-01-01',
            },
          },
          defaultParameters: {
            deposit: {
              defaultValue: 10,
              defaultType: 'Percentage',
            },
            term: {
              defaultValue: 60,
            },
            annualMileage: {
              defaultValue: 10000,
            },
          },
        })
      } else {
        setTimeout(loadPlugin, 100)
      }
    }

    script.onload = loadPlugin

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [price, mileage, imageUrl, registration, firstRegistrationDate])

  return (
    <div className="space-y-8">
      {/* Vehicle summary — only rendered when params are present */}
      {hasVehicleData && (
        <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          {imageUrl && (
            <div className="h-32 w-full sm:w-48 shrink-0 overflow-hidden rounded-xl border border-white/10">
              <img
                src={imageUrl}
                alt="Selected vehicle"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-col justify-center gap-2">
            {registration && (
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                Reg: {registration}
              </p>
            )}
            {priceNum && (
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-black text-white">{formatPrice(priceNum)}</p>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Cash Price</span>
              </div>
            )}
            {mileageNum && (
              <p className="text-sm text-zinc-400">{formatMileage(mileageNum)}</p>
            )}
            <div className="flex gap-3 mt-1">
              {stockId ? (
                <Link
                  href={`/used-cars`}
                  className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ← Back to Showroom
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Soft-search notice */}
      <div className="flex items-start gap-3 rounded-xl border border-teal-500/30 bg-teal-500/5 px-4 py-3">
        <span className="mt-0.5 text-teal-400 text-lg leading-none">✓</span>
        <div>
          <p className="text-sm font-bold text-teal-400 uppercase tracking-wider">Soft Search Available</p>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            Many of our lenders perform an initial soft search, which does not affect your credit score. A full hard search is only carried out upon acceptance of a finance proposal.
          </p>
        </div>
      </div>

      {/* Codeweavers calculator */}
      <div
        id="cw-finance-plugin"
        className="min-h-130 rounded-xl overflow-hidden bg-white/5"
      />

      {/* Representative example */}
      <p className="text-[10px] text-zinc-600 leading-relaxed text-center">
        Finance is subject to status. Representative example: 8.9% APR. Based on a cash price of £20,995, 10% deposit (£2,099.50), 60 monthly repayments of £466.24. Total amount payable £24,479.02. We are a credit broker, not a lender.
      </p>
    </div>
  )
}

export default FinanceApplicationForm
