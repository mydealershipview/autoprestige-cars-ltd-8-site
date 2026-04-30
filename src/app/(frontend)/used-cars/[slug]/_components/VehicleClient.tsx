'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  X,
  Maximize2,
} from 'lucide-react'
import { AutoTraderVehicle } from '@/utilities/autotrader'

import {
  ReserveModal,
  CallUsModal,
  FinanceModal,
  PartExchangeModal,
  EmailModal,
} from './modals'

interface VehicleClientProps {
  vehicle: AutoTraderVehicle
  dealershipName: string
  phoneNumber: string
  whatsappNumber: string
  emailAddress: string
}

export default function VehicleClient({
  vehicle,
  dealershipName,
  phoneNumber,
  whatsappNumber,
  emailAddress,
}: VehicleClientProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const lightboxThumbsRef = useRef<HTMLDivElement>(null)

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
    document.body.style.overflow = ''
  }

  const lightboxPrev = () =>
    setLightboxIndex((prev) => (prev !== null ? (prev === 0 ? images.length - 1 : prev - 1) : null))

  const lightboxNext = () =>
    setLightboxIndex((prev) => (prev !== null ? (prev === images.length - 1 ? 0 : prev + 1) : null))

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex])

  useEffect(() => {
    if (lightboxIndex === null || !lightboxThumbsRef.current) return
    const thumb = lightboxThumbsRef.current.children[lightboxIndex] as HTMLElement
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [lightboxIndex])

  // Modal States
  const [showReserve, setShowReserve] = useState(false)
  const [showCallUs, setShowCallUs] = useState(false)
  const [showFinance, setShowFinance] = useState(false)
  const [showPartExchange, setShowPartExchange] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  const make = vehicle.vehicle.make || vehicle.vehicle.standard?.make || ''
  const model = vehicle.vehicle.model || vehicle.vehicle.standard?.model || ''
  const derivative = vehicle.vehicle.derivative || vehicle.vehicle.standard?.derivative || ''

  const isSold = vehicle.metadata?.lifecycleState === 'SOLD'

  const price = vehicle.adverts?.forecourtPrice?.amountGBP || vehicle.adverts?.retailAdverts?.suppliedPrice?.amountGBP
  const wasPrice = vehicle.adverts?.soldPrice?.amountGBP || null

  const images = (vehicle.media?.images || []).filter((image) => {
    const href = image?.href?.toLowerCase() || ''
    return href && !href.includes('youtube.com') && !href.includes('youtu.be') && !href.includes('vimeo.com')
  })
  const hasImages = images.length > 0
  const activeImage = hasImages ? images[activeImageIndex].href : '/placeholder.svg'
  const secondaryImage = hasImages && activeImageIndex + 1 < images.length
    ? images[activeImageIndex + 1].href
    : null

  const getVehicleImageUrl = (vehicle: AutoTraderVehicle): string => {
    if (vehicle.media?.images && vehicle.media.images.length > 0) {
      const exteriorImages = vehicle.media.images
      const imagesToUse = exteriorImages.length > 0 ? exteriorImages : vehicle.media.images.filter((img: any) =>
        !img.classificationTags?.some((tag: any) => tag.label === 'Promotional Material')
      )

      if (imagesToUse.length > 0) {
        return imagesToUse[0].href // Return first actual vehicle image
      }
    }
    // Fallback to default image if no vehicle images found
    return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center'
  }

  const nextImage = () => setActiveImageIndex((prev) => (prev + 2 >= images.length ? 0 : prev + 2))
  const prevImage = () => setActiveImageIndex((prev) =>
    prev < 2 ? (images.length % 2 === 0 ? images.length - 2 : images.length - 1) : prev - 2
  )

  const vehicleImageUrl = getVehicleImageUrl(vehicle)

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://plugins.codeweavers.app/scripts/v1/platform/finance?ApiKey=U86tH2vLnYI0LyA2D5'
    script.async = true
    document.head.appendChild(script)

    const setupCalculator = () => {
      const button = document.getElementById('cw_standalone_calculate_button')
      if (button && (window as any).codeweavers) {
        button.onclick = function () {
          loadPlugin()
        }
        loadPlugin() // Auto-load on initial load
      } else {
        setTimeout(setupCalculator, 100)
      }
    }

    const loadPlugin = () => {
      if ((window as any).codeweavers) {
        (window as any).codeweavers.main({
          pluginContentDivId: 'codeweavers-plugin',
          vehicle: {
            type: 'Car',
            cashPrice: price?.toString() || "0", // AUTO-POPULATED WITH VEHICLE PRICE
            mileage: vehicle?.vehicle?.odometerReadingMiles || "0",
            isNew: "false",
            identifierType: '',
            identifier: " ",
            imageUrl: vehicleImageUrl, // UPDATED: Use actual vehicle image instead of default
            linkBackUrl: "https://www.autoprestigecars.co.uk/",
            registration: {
              number: vehicle.vehicle?.registration || vehicle?.registration || "NOVEHICLE",
              date: vehicle?.vehicle?.firstRegistrationDate || "2000-01-01",
            }
          },
          defaultParameters: {
            deposit: {
              defaultValue: 10,
              defaultType: "Percentage"
            },
            term: {
              defaultValue: 60,
            },
            annualMileage: {
              defaultValue: 10000,
            },
          },
        })
      }
    }

    script.onload = setupCalculator

    return () => {
      document.head.removeChild(script)
    }
  }, [price, vehicleImageUrl])

  const calculateMonthlyPayment = (priceValue: number | null) => {
    if (!priceValue || priceValue <= 0) return 'N/A'
    const deposit = priceValue * 0.1
    const loanAmount = priceValue - deposit
    const monthlyRate = 0.089 / 12
    const numPayments = 60
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(monthlyPayment)
  }

  const specRows = [
    { label: 'Reg', value: vehicle.vehicle.registration || 'N/A' },
    { label: 'Year', value: vehicle.vehicle.yearOfManufacture ? vehicle.vehicle.yearOfManufacture.toString() : 'N/A' },
    { label: 'Transmission', value: vehicle.vehicle.transmissionType || vehicle.vehicle.standard?.transmissionType || 'N/A' },
    { label: 'Body Type', value: vehicle.vehicle.bodyType || vehicle.vehicle.standard?.bodyType || 'N/A' },
    { label: 'Fuel Type', value: vehicle.vehicle.fuelType || vehicle.vehicle.standard?.fuelType || 'N/A' },
    { label: 'Engine Size', value: vehicle.vehicle.badgeEngineSizeLitres ? `${vehicle.vehicle.badgeEngineSizeLitres.toFixed(1)}L` : 'N/A' },
    { label: 'Doors', value: vehicle.vehicle.doors ? vehicle.vehicle.doors.toString() : 'N/A' },
    { label: 'Mileage', value: vehicle.vehicle.odometerReadingMiles ? `${new Intl.NumberFormat('en-GB').format(vehicle.vehicle.odometerReadingMiles)} mi` : 'N/A' },
  ]

  const handleWhatsapp = () => {
    const message = `Hello, I'm interested in the ${make} ${model} ${vehicle.vehicle.registration ? `(${vehicle.vehicle.registration})` : ''}. Could you please provide more information?`
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, '_blank')
  }

  return (
    <main className="min-h-screen bg-black text-white pt-22 pb-20">
      <div className="mx-auto w-full max-w-[1600px] px-3 md:px-6">
        <div className="mb-3 grid grid-cols-1 gap-3 border border-white/15 p-4 lg:grid-cols-[1fr_auto]">
          <Link href="/used-cars" className="inline-flex items-center gap-2 border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Link>
        </div>

        <div className="relative grid grid-cols-1 overflow-hidden border border-white/15 lg:grid-cols-2">
            {hasImages && images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 bg-black/55 p-2 text-white hover:bg-black/80">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 bg-black/55 p-2 text-white hover:bg-black/80">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

          <div className="relative h-[320px] bg-zinc-900 sm:h-[420px] lg:h-[560px] xl:h-[620px] group/left">
            {hasImages ? (
              <>
                <img
                  src={activeImage}
                  alt={`${make} ${model}`}
                  className={`h-full w-full object-cover cursor-pointer ${isSold ? 'brightness-50' : ''}`}
                  onClick={() => openLightbox(activeImageIndex)}
                />
                <button
                  onClick={() => openLightbox(activeImageIndex)}
                  className="absolute top-3 right-3 z-10 bg-black/60 p-1.5 text-white opacity-0 group-hover/left:opacity-100 transition-opacity hover:bg-black/90"
                  aria-label="View fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm uppercase tracking-[0.12em] text-zinc-500">
                No Image Available
              </div>
            )}

            {isSold && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-red-500 px-8 py-4 -rotate-12">
                  <span className="text-5xl font-black uppercase tracking-[0.2em] text-red-500 drop-shadow-lg">SOLD</span>
                </div>
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 text-xs font-semibold text-zinc-200">
              {images.length > 0
                ? `${activeImageIndex + 1}–${Math.min(activeImageIndex + 2, images.length)} / ${images.length}`
                : '0 / 0'}
            </div>
          </div>

          <div className="relative h-[320px] border-t border-white/10 bg-zinc-950 sm:h-[420px] lg:h-[560px] lg:border-l lg:border-t-0 xl:h-[620px] group/right">
            {secondaryImage ? (
              <>
                <img
                  src={secondaryImage}
                  alt={`${make} ${model} secondary view`}
                  className="h-full w-full object-cover cursor-pointer"
                  onClick={() => openLightbox(activeImageIndex + 1)}
                />
                <button
                  onClick={() => openLightbox(activeImageIndex + 1)}
                  className="absolute top-3 right-3 z-10 bg-black/60 p-1.5 text-white opacity-0 group-hover/right:opacity-100 transition-opacity hover:bg-black/90"
                  aria-label="View fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm uppercase tracking-[0.12em] text-zinc-500">
                More Photos Coming Soon
              </div>
            )}
          </div>
        </div>

        {hasImages && (
          <div className="mb-4 flex gap-2 overflow-x-auto border-x border-b border-white/15 bg-black px-2 py-2 hide-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx % 2 === 0 ? idx : idx - 1)}
                className={`relative h-20 w-30 shrink-0 overflow-hidden border ${
                  idx === activeImageIndex || idx === activeImageIndex + 1 ? 'border-blue-400 border-2' : 'border-white/20'
                }`}
              >
                <img src={img.href} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="border border-white/12 bg-black p-6 md:p-8">
            <h1 className="mb-2 text-3xl font-semibold uppercase tracking-[0.06em] text-white md:text-4xl">
              {make} {model}
            </h1>
            {derivative && (
              <p className="mb-6 text-sm uppercase tracking-[0.15em] text-zinc-400">{derivative}</p>
            )}
            {vehicle.adverts?.retailAdverts?.description ? (
              <div className="text-sm leading-7 text-zinc-300">
                {vehicle.adverts.retailAdverts.description}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Description coming soon.</p>
            )}

            <div id='cw_standalone_calculate_button' className='mt-10'>
              <div style={{ width: '100%' }}>
                <div
                  id="codeweavers-plugin"
                  className="overflow-hidden bg-white/5 min-h-100"
                ></div>
              </div>
            </div>
          </section>

          <aside className="border border-white/12 bg-black p-5">
            <p className="border-b border-white/10 pb-3 text-xs uppercase tracking-[0.14em] text-zinc-400">{dealershipName}</p>

            {isSold && (
              <div className="mt-3 flex items-center gap-2 bg-red-600/15 border border-red-500/40 px-3 py-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-red-400">SOLD</span>
                <span className="text-xs text-red-300/80">This vehicle has been sold</span>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Our Price</p>
                <p className="text-4xl font-bold text-white">{price ? `£${new Intl.NumberFormat('en-GB').format(price)}` : 'POA'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Est. Monthly</p>
                <p className="text-3xl font-bold text-blue-400">{price ? `${calculateMonthlyPayment(price)}/mo` : 'N/A'}</p>
                {wasPrice && <p className="mt-1 text-xs text-zinc-400 line-through">Was £{new Intl.NumberFormat('en-GB').format(wasPrice)}</p>}
                {price && (
                  <p className="mt-1.5 text-[12px] font-medium text-zinc-200 leading-snug">
                    For illustration only &middot;{' '}
                    <Link
                      href={`/finance?${new URLSearchParams({
                        price: price.toString(),
                        ...(vehicle.vehicle?.odometerReadingMiles ? { mileage: vehicle.vehicle.odometerReadingMiles.toString() } : {}),
                        imageUrl: vehicleImageUrl,
                        ...(vehicle.vehicle?.registration ? { registration: vehicle.vehicle.registration } : {}),
                        ...(vehicle.vehicle?.firstRegistrationDate ? { firstRegistrationDate: vehicle.vehicle.firstRegistrationDate } : {}),
                        ...(vehicle.metadata?.stockId ? { stockId: vehicle.metadata.stockId } : {}),
                      }).toString()}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Get Quotes
                    </Link>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              {specRows.map((item, i) => (
                <div key={item.label} className={`grid grid-cols-2 text-sm py-2 ${i < specRows.length - 1 ? 'border-b border-white/8' : ''}`}>
                  <span className="text-zinc-500">{item.label}</span>
                  <span className="text-right font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2">
              {isSold && (
                <p className="mb-1 text-xs leading-relaxed text-zinc-400 border border-white/10 bg-white/4 px-3 py-2">
                  This vehicle has already been sold and is no longer available. Please browse our current stock or contact us for similar options.
                </p>
              )}
              <button onClick={() => setShowEmail(true)} disabled={isSold} className="w-full bg-white py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black hover:bg-zinc-100 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white">
                Enquire Now
              </button>
              <button onClick={handleWhatsapp} disabled={isSold} className="flex w-full items-center justify-center gap-2 bg-emerald-600 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-emerald-700 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-emerald-600">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
              <button onClick={() => {
                const section = document.getElementById("cw_standalone_calculate_button");
                section?.scrollIntoView({ behavior: "smooth" });
              }} disabled={isSold} className="w-full bg-blue-500 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-blue-600 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-blue-500">
                Apply For Finance
              </button>
              <button onClick={() => setShowReserve(true)} disabled={isSold} className="w-full border border-white/25 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-white/8 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                Reserve Vehicle
              </button>
              <button onClick={() => setShowPartExchange(true)} disabled={isSold} className="w-full border border-white/15 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-400 hover:border-white/30 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-white/15 disabled:hover:text-zinc-400">
                Part Exchange
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-9999 flex flex-col bg-black/95 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox() }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
              {make} {model} &mdash; {lightboxIndex + 1} / {images.length}
            </span>
            <button onClick={closeLightbox} className="p-2 text-zinc-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main image */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden min-h-0">
            <button
              onClick={lightboxPrev}
              className="absolute left-3 z-10 bg-black/60 p-3 text-white hover:bg-black/90 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <img
              key={lightboxIndex}
              src={images[lightboxIndex].href}
              alt={`${make} ${model} image ${lightboxIndex + 1}`}
              className="max-h-full max-w-full object-contain select-none"
            />
            <button
              onClick={lightboxNext}
              className="absolute right-3 z-10 bg-black/60 p-3 text-white hover:bg-black/90 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div
            ref={lightboxThumbsRef}
            className="flex gap-2 overflow-x-auto px-3 py-3 border-t border-white/10 shrink-0 hide-scrollbar"
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden border-2 transition-colors ${
                  idx === lightboxIndex ? 'border-blue-400' : 'border-white/15 hover:border-white/40'
                }`}
              >
                <img src={img.href} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showReserve && (
        <ReserveModal
          vehicleMake={make}
          vehicleModel={model}
          vehicleReg={vehicle.vehicle.registration || ''}
          vehiclePrice={price}
          stockId={vehicle.metadata?.stockId}
          onClose={() => setShowReserve(false)}
        />
      )}
      {showCallUs && (
        <CallUsModal
          phoneNumber={phoneNumber || ''}
          vehicleMake={make}
          vehicleModel={model}
          vehicleReg={vehicle.vehicle.registration || ''}
          vehiclePrice={price}
          stockId={vehicle.metadata?.stockId}
          onClose={() => setShowCallUs(false)}
        />
      )}
      {showFinance && (
        <FinanceModal
          vehicleMake={make}
          vehicleModel={model}
          vehicleReg={vehicle.vehicle.registration || ''}
          vehiclePrice={price}
          stockId={vehicle.metadata?.stockId}
          onClose={() => setShowFinance(false)}
        />
      )}
      {showPartExchange && (
        <PartExchangeModal
          vehicleMake={make}
          vehicleModel={model}
          vehicleReg={vehicle.vehicle.registration || ''}
          vehiclePrice={price}
          stockId={vehicle.metadata?.stockId}
          onClose={() => setShowPartExchange(false)}
        />
      )}
      {showEmail && (
        <EmailModal
          emailAddress={emailAddress || 'info@dealership.co.uk'}
          vehicleMake={make}
          vehicleModel={model}
          vehicleReg={vehicle.vehicle.registration || ''}
          vehiclePrice={price}
          stockId={vehicle.metadata?.stockId}
          onClose={() => setShowEmail(false)}
        />
      )}
    </main>
  )
}
