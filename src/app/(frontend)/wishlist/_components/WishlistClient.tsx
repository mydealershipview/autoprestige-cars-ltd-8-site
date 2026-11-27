'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useWishlist, type WishlistVehicle } from '@/contexts/WishlistContext'
import { MAX_COMPARE, toggleCompare } from '@/utilities/wishlistVehicle'

const money = (value?: string) => (value && Number(value) > 0 ? `£${new Intl.NumberFormat('en-GB').format(Number(value))}` : 'POA')
const miles = (value?: string) => (value ? `${new Intl.NumberFormat('en-GB').format(Number(value))} mi` : '—')
const carHref = (car: WishlistVehicle) => car.href || '/usedcars'

const COMPARE_ROWS: Array<{ label: string; value: (car: WishlistVehicle) => string }> = [
  { label: 'Price', value: (car) => money(car.price) },
  { label: 'Year', value: (car) => car.year || '—' },
  { label: 'Mileage', value: (car) => miles(car.mileage) },
  { label: 'Fuel Type', value: (car) => car.fuel || '—' },
  { label: 'Transmission', value: (car) => car.transmission || '—' },
  { label: 'Body Type', value: (car) => car.bodyType || '—' },
  { label: 'Engine Size', value: (car) => car.engineSize || '—' },
  { label: 'Colour', value: (car) => car.colour || '—' },
  { label: 'Doors', value: (car) => car.doors || '—' },
  { label: 'Seats', value: (car) => car.seats || '—' },
]

/** Shortlist (Upgrade Spec 7): saved cars, with a side-by-side comparison of up to 3. Browser only. */
export default function WishlistClient() {
  const { wishlistItems, removeFromWishlist } = useWishlist()
  const [selected, setSelected] = useState<string[]>([])
  const [limitMessage, setLimitMessage] = useState<string | null>(null)

  const compared = selected
    .map((id) => wishlistItems.find((car) => car.stockId === id))
    .filter((car): car is WishlistVehicle => Boolean(car))

  const onTick = (stockId: string) => {
    const result = toggleCompare(selected, stockId)
    setSelected(result.selected)
    setLimitMessage(result.refused ? `You can compare up to ${MAX_COMPARE} cars. Untick one to add another.` : null)
  }

  const onRemove = (stockId: string) => {
    setSelected((prev) => prev.filter((id) => id !== stockId))
    setLimitMessage(null)
    removeFromWishlist(stockId)
  }

  return (
    <main className="min-h-screen bg-black text-white pt-22 pb-20">
      <div className="mx-auto w-full max-w-[1600px] px-3 md:px-6">
        <div className="text-center py-9 border-b border-white/10 mb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-[0.2em] uppercase">Your Shortlist</h1>
          <p className="text-sm tracking-[0.15em] text-gray-400 mt-2 uppercase font-medium">
            {wishlistItems.length > 0 ? `Tick up to ${MAX_COMPARE} cars to compare them side by side` : ''}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-white font-medium mb-2">No saved vehicles yet</p>
            <p className="text-gray-500 text-sm mb-5">Tap the heart on any car to add it to your shortlist.</p>
            <Link href="/usedcars" className="px-6 py-2.5 bg-white text-black rounded font-semibold text-sm hover:bg-gray-100 !transition-colors">
              Browse Our Showroom
            </Link>
          </div>
        ) : (
          <>
            {limitMessage && (
              <p role="alert" className="mb-4 border-l-2 border-blue-400 bg-blue-400/8 px-4 py-2.5 text-sm font-medium text-blue-200">
                {limitMessage}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {wishlistItems.map((car) => {
                const ticked = selected.includes(car.stockId)
                return (
                  <div key={car.stockId} className={`bg-[#1a1a1a] flex flex-col overflow-hidden border ${ticked ? 'border-blue-400' : 'border-transparent'}`}>
                    <Link href={carHref(car)} className="relative block h-56 bg-zinc-900">
                      {car.image ? (
                        <img src={car.image} alt={car.title} className="h-full w-full object-contain" loading="lazy" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.16em] text-zinc-600">No image</div>
                      )}
                    </Link>
                    <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3">
                      <p className="text-base font-extrabold uppercase tracking-wide leading-tight truncate">{car.title}</p>
                      <p className="mt-1 text-sm font-bold text-white">{money(car.price)}</p>
                      <p className="mt-1 text-[11px] text-gray-400">
                        {[car.year, car.mileage ? miles(car.mileage) : null, car.fuel, car.transmission].filter(Boolean).join(' · ')}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-white cursor-pointer">
                          <input type="checkbox" checked={ticked} onChange={() => onTick(car.stockId)} className="h-4 w-4 accent-blue-500" />
                          Compare
                        </label>
                        <button
                          type="button"
                          onClick={() => onRemove(car.stockId)}
                          aria-label={`Remove ${car.title} from shortlist`}
                          className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-gray-400 hover:text-white !transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                    <Link
                      href={carHref(car)}
                      className="block text-center bg-[#0c6dff] hover:bg-blue-600 !transition-colors py-2.5 text-[11px] font-extrabold tracking-[0.15em] uppercase text-white mt-auto"
                    >
                      More &rsaquo;
                    </Link>
                  </div>
                )
              })}
            </div>

            <section aria-labelledby="compare-title" className="mt-8 border border-white/15 p-4 md:p-5">
              <h2 id="compare-title" className="text-lg font-bold uppercase tracking-[0.12em] text-white">Compare</h2>
              {compared.length < 2 ? (
                <p className="mt-2 text-xs text-zinc-400">Tick 2 or 3 cars above to see them side by side.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  {/* Equal car columns (table-fixed): every 4:3 photo is the same height, so photos and names line up */}
                  <table className="w-full min-w-[560px] table-fixed border-collapse text-sm">
                    <thead>
                      <tr>
                        <th scope="col" className="w-28 border-b border-white/10 p-2 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                          <span className="sr-only">Detail</span>
                        </th>
                        {compared.map((car) => (
                          <th key={car.stockId} scope="col" className="border-b border-white/10 p-2 text-left align-top font-normal">
                            <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                              {car.image ? (
                                <img src={car.image} alt={car.title} className="h-full w-full object-cover" loading="lazy" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.16em] text-zinc-600">No image</div>
                              )}
                            </div>
                            <p className="mt-2 text-sm font-extrabold uppercase tracking-wide text-white">{car.title}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARE_ROWS.map((row) => (
                        <tr key={row.label}>
                          <th scope="row" className="border-b border-white/8 p-2 text-left text-xs font-normal text-zinc-500">{row.label}</th>
                          {compared.map((car) => (
                            <td key={car.stockId} className="border-b border-white/8 p-2 font-semibold text-white">{row.value(car)}</td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <th scope="row" className="p-2"><span className="sr-only">Link</span></th>
                        {compared.map((car) => (
                          <td key={car.stockId} className="p-2">
                            <Link href={carHref(car)} className="inline-block border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200 hover:bg-white/10">
                              View car
                            </Link>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
