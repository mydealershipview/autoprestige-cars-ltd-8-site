'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Phone,
  X,
} from 'lucide-react'
import { AutoTraderVehicle } from '@/utilities/autotrader'

interface VehicleClientProps {
  vehicle: AutoTraderVehicle
  dealershipName: string
  phoneNumber: string
  whatsappNumber: string
  emailAddress: string
}

const money = (value: number | null | undefined) =>
  value
    ? new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    : 'POA'

const mileage = (value: number | null | undefined) =>
  value ? `${new Intl.NumberFormat('en-GB').format(value)} miles` : 'N/A'

interface SpecRow {
  label: string
  value: string
  positive?: boolean
}

export default function VehicleClient({
  vehicle,
  phoneNumber,
  emailAddress,
}: VehicleClientProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const lightboxThumbsRef = useRef<HTMLDivElement>(null)

  const make = vehicle.vehicle.make || vehicle.vehicle.standard?.make || ''
  const model = vehicle.vehicle.model || vehicle.vehicle.standard?.model || ''
  const year = vehicle.vehicle.yearOfManufacture
  const price =
    vehicle.adverts?.forecourtPrice?.amountGBP ||
    vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP ||
    vehicle.adverts?.retailAdverts?.suppliedPrice?.amountGBP
  const images = (vehicle.media?.images || []).filter((image) => {
    const href = image?.href?.toLowerCase() || ''
    return href && !href.includes('youtube.com') && !href.includes('youtu.be') && !href.includes('vimeo.com')
  })
  const hasImages = images.length > 0
  const activeImage = hasImages ? images[activeImageIndex].href : '/placeholder.svg'
  const cleanPhone = phoneNumber || '07441 940552'
  const telHref = `tel:${cleanPhone.replace(/\D/g, '')}`
  const autoTraderUrl = vehicle.advertiser?.website || ''
  const description =
    vehicle.adverts?.retailAdverts?.description ||
    `${year || ''} ${make} ${model} available now. Contact us for more information or to arrange a viewing.`

  const tags = [
    vehicle.vehicle.transmissionType || vehicle.vehicle.standard?.transmissionType,
    vehicle.vehicle.bodyType || vehicle.vehicle.standard?.bodyType,
    vehicle.vehicle.badgeEngineSizeLitres ? `${vehicle.vehicle.badgeEngineSizeLitres.toFixed(1)}L` : null,
    vehicle.vehicle.colour || vehicle.vehicle.standard?.colour,
  ].filter(Boolean)

  const primarySpecRows: SpecRow[] = [
    { label: 'Make', value: make || 'N/A' },
    { label: 'Model', value: model || 'N/A' },
    { label: 'Year', value: year?.toString() || 'N/A' },
    { label: 'Body Style', value: vehicle.vehicle.bodyType || vehicle.vehicle.standard?.bodyType || 'N/A' },
    { label: 'Colour', value: vehicle.vehicle.colour || vehicle.vehicle.standard?.colour || 'N/A' },
    { label: 'Doors', value: vehicle.vehicle.doors?.toString() || 'N/A' },
    {
      label: 'Engine Size',
      value: vehicle.vehicle.badgeEngineSizeLitres ? `${vehicle.vehicle.badgeEngineSizeLitres.toFixed(1)}L` : 'N/A',
    },
    { label: 'Fuel Type', value: vehicle.vehicle.fuelType || vehicle.vehicle.standard?.fuelType || 'N/A' },
    {
      label: 'Transmission',
      value: vehicle.vehicle.transmissionType || vehicle.vehicle.standard?.transmissionType || 'N/A',
    },
  ]

  const secondarySpecRows: SpecRow[] = [
    { label: 'Mileage', value: mileage(vehicle.vehicle.odometerReadingMiles) },
    {
      label: 'Previous Owners',
      value: vehicle.vehicle.owners ? `${vehicle.vehicle.owners} owner${vehicle.vehicle.owners === 1 ? '' : 's'}` : 'Unknown',
    },
    { label: 'Service History', value: vehicle.vehicle.serviceHistory || 'Unknown' },
    { label: 'HPI Clear', value: 'Yes', positive: true },
  ]

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
    document.body.style.overflow = ''
  }

  const previousImage = () => {
    setActiveImageIndex((index) => (index === 0 ? images.length - 1 : index - 1))
  }

  const nextImage = () => {
    setActiveImageIndex((index) => (index === images.length - 1 ? 0 : index + 1))
  }

  const lightboxPrevious = () => {
    setLightboxIndex((index) => (index === null ? null : index === 0 ? images.length - 1 : index - 1))
  }

  const lightboxNext = () => {
    setLightboxIndex((index) => (index === null ? null : index === images.length - 1 ? 0 : index + 1))
  }

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowLeft') lightboxPrevious()
      if (event.key === 'ArrowRight') lightboxNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex])

  useEffect(() => {
    if (lightboxIndex === null || !lightboxThumbsRef.current) return
    const thumb = lightboxThumbsRef.current.children[lightboxIndex] as HTMLElement
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [lightboxIndex])

  return (
    <main className="min-h-screen bg-[#111] pb-16 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-7 flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-500">
          <Link href="/" className="transition-colors hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/usedcars" className="transition-colors hover:text-white">Stock</Link>
          <span>/</span>
          <span className="text-gray-200">{year} {make} {model}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a]">
              <div className="relative aspect-[16/10] bg-black">
                {hasImages ? (
                  <img
                    src={activeImage}
                    alt={`${make} ${model}`}
                    className="h-full w-full cursor-pointer object-cover"
                    onClick={() => openLightbox(activeImageIndex)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-bold uppercase tracking-[0.16em] text-gray-600">
                    No Image Available
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/70"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/70"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-sm font-bold text-white">
                      {activeImageIndex + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>

              {hasImages && (
                <div className="flex gap-3 overflow-x-auto p-4">
                  {images.map((image, index) => (
                    <button
                      key={`${image.href}-${index}`}
                      onClick={() => setActiveImageIndex(index)}
                      className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        index === activeImageIndex ? 'border-[#c8e63c]' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`Show image ${index + 1}`}
                    >
                      <img src={image.href} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8 rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 sm:p-8">
              <h2 className="mb-5 text-xl font-black text-white">About This Vehicle</h2>
              <p className="text-base font-semibold leading-8 text-gray-300">{description}</p>
            </section>

            <section className="mt-8 rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 sm:p-8">
              <h2 className="mb-8 text-xl font-black text-white">Full Specifications</h2>
              <div className="grid gap-8 xl:grid-cols-2 xl:gap-12">
                {[primarySpecRows, secondarySpecRows].map((column, columnIndex) => (
                  <div key={columnIndex}>
                    {column.map((item) => (
                      <div key={item.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-b border-white/8 py-4">
                        <span className="min-w-0 text-base font-bold text-gray-500">{item.label}</span>
                        <span className={`text-right text-base font-black ${item.positive ? 'text-emerald-400' : 'text-white'}`}>
                          {item.positive ? (
                            <span className="inline-flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5" />
                              {item.value}
                            </span>
                          ) : (
                            item.value
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
              <p className="mb-2 text-sm font-black uppercase tracking-[0.22em] text-gray-500">{make}</p>
              <h1 className="text-4xl font-black leading-none text-white">{model}</h1>
              <p className="mt-4 text-lg font-bold text-gray-400">
                {[year, vehicle.vehicle.odometerReadingMiles ? `${new Intl.NumberFormat('en-GB').format(vehicle.vehicle.odometerReadingMiles)} mi` : null, vehicle.vehicle.fuelType || vehicle.vehicle.standard?.fuelType]
                  .filter(Boolean)
                  .join(' - ')}
              </p>
              <p className="mt-7 text-5xl font-black text-[#c8e63c]">{money(price)}</p>

              {tags.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-3">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-7 inline-flex items-center gap-2 text-sm font-black text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                HPI Clear
              </p>

              <a
                href={telHref}
                className="mt-7 flex h-14 items-center justify-center gap-3 rounded-xl bg-[#c8e63c] text-lg font-black text-black transition-colors hover:bg-[#b8d632]"
              >
                <Phone className="h-5 w-5" />
                {cleanPhone}
              </a>

              {autoTraderUrl && (
                <a
                  href={autoTraderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex h-14 items-center justify-center gap-3 rounded-xl border border-white/15 text-base font-black text-gray-300 transition-colors hover:border-[#c8e63c] hover:text-white"
                >
                  View on AutoTrader
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
              <h2 className="mb-5 text-xl font-black text-white">Enquire About This Car</h2>
              <form action={`mailto:${emailAddress || 'info@dealership.co.uk'}`} className="space-y-4">
                <input
                  name="name"
                  placeholder="Your name *"
                  className="h-14 w-full rounded-xl border border-white/10 bg-[#101010] px-4 text-base font-semibold text-white placeholder:text-slate-600 focus:border-[#c8e63c] focus:outline-none"
                />
                <input
                  name="phone"
                  placeholder="Phone number"
                  className="h-14 w-full rounded-xl border border-white/10 bg-[#101010] px-4 text-base font-semibold text-white placeholder:text-slate-600 focus:border-[#c8e63c] focus:outline-none"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email address *"
                  className="h-14 w-full rounded-xl border border-white/10 bg-[#101010] px-4 text-base font-semibold text-white placeholder:text-slate-600 focus:border-[#c8e63c] focus:outline-none"
                />
                <textarea
                  name="message"
                  defaultValue={`I'm interested in the ${year || ''} ${make} ${model}...`}
                  className="min-h-32 w-full resize-none rounded-xl border border-white/10 bg-[#101010] px-4 py-4 text-base font-semibold text-slate-500 placeholder:text-slate-600 focus:border-[#c8e63c] focus:outline-none"
                />
                <button className="h-14 w-full rounded-xl bg-[#c8e63c] text-base font-black uppercase tracking-wide text-black transition-colors hover:bg-[#b8d632]">
                  Send Enquiry
                </button>
              </form>
            </section>
          </aside>
        </div>
      </div>

      {lightboxIndex !== null && hasImages && (
        <div
          className="fixed inset-0 z-9999 flex flex-col bg-black/95"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLightbox()
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              {make} {model} - {lightboxIndex + 1} / {images.length}
            </span>
            <button onClick={closeLightbox} className="p-2 text-gray-400 transition-colors hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            <button onClick={lightboxPrevious} className="absolute left-4 rounded-full bg-black/60 p-3 text-white hover:bg-black">
              <ChevronLeft className="h-7 w-7" />
            </button>
            <img src={images[lightboxIndex].href} alt={`${make} ${model}`} className="max-h-full max-w-full object-contain" />
            <button onClick={lightboxNext} className="absolute right-4 rounded-full bg-black/60 p-3 text-white hover:bg-black">
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
          <div ref={lightboxThumbsRef} className="flex gap-2 overflow-x-auto border-t border-white/10 px-3 py-3">
            {images.map((image, index) => (
              <button
                key={`${image.href}-lightbox-${index}`}
                onClick={() => setLightboxIndex(index)}
                className={`h-16 w-24 shrink-0 overflow-hidden rounded border-2 ${
                  index === lightboxIndex ? 'border-[#c8e63c]' : 'border-white/15'
                }`}
              >
                <img src={image.href} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
