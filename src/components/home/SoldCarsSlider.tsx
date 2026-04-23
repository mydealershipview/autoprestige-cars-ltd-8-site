'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
// Swiper CSS is imported globally in globals.css
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AutoTraderVehicle } from '@/utilities/autotrader'
import { formatPrice, generateVehicleSlug } from '@/utilities/formatVehicleData'

export function SoldCarsSlider() {
  const [vehicles, setVehicles] = useState<AutoTraderVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    fetch('/api/sold-listings?pageSize=20&sortBy=dateAdded&sortOrder=desc')
      .then((r) => r.json())
      .then((data) => {
        setVehicles(data.results || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSwiper = (swiper: SwiperType) => {
    swiperRef.current = swiper
    if (prevRef.current && nextRef.current) {
      // @ts-ignore
      swiper.params.navigation.prevEl = prevRef.current
      // @ts-ignore
      swiper.params.navigation.nextEl = nextRef.current
      swiper.navigation.destroy()
      swiper.navigation.init()
      swiper.navigation.update()
    }
  }

  // Always render the section wrapper so it's visible — show skeleton while loading
  return (
    <section className="relative w-full overflow-hidden bg-[#0d0d0d] border-t-4 border-blue-500">
      {/* Diagonal line texture — matches page's angular aesthetic */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 60px)',
        }}
      />

      <div className="relative px-6 lg:px-12 pt-14 pb-16">
        {/* Header row */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="flex items-center mb-3">
              <div className="w-6 h-5 bg-blue-500 mr-4 shrink-0 -skew-x-24" />
              <h2 className="text-3xl lg:text-4xl font-black tracking-widest uppercase text-white leading-tight">
                RECENTLY SOLD
              </h2>
            </div>
            <p className="text-sm text-zinc-500 tracking-[0.18em] font-semibold uppercase ml-10">
              Vehicles that have found their new owners
            </p>
          </div>

          {/* Desktop prev/next */}
          <div className="hidden lg:flex items-center gap-2 shrink-0 ml-8">
            <button
              ref={prevRef}
              aria-label="Previous"
              className="w-11 h-11 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:border-blue-500 hover:text-blue-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              ref={nextRef}
              aria-label="Next"
              className="w-11 h-11 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:border-blue-500 hover:text-blue-400 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 animate-pulse">
                <div className="h-44 bg-zinc-800" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-zinc-700 w-3/4" />
                  <div className="h-2.5 bg-zinc-700 w-1/2" />
                  <div className="h-3 bg-zinc-700 w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Swiper — rendered once data is ready */}
        {!loading && vehicles.length > 0 && (
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            onSwiper={handleSwiper}
            slidesPerView={1.2}
            spaceBetween={14}
            loop={vehicles.length >= 5}
            autoplay={{ delay: 3600, disableOnInteraction: false, pauseOnMouseEnter: true }}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            pagination={{
              clickable: true,
              bulletClass: 'sold-dot',
              bulletActiveClass: 'sold-dot-active',
            }}
            breakpoints={{
              480: { slidesPerView: 1.8, spaceBetween: 14 },
              768: { slidesPerView: 2.6, spaceBetween: 16 },
              1024: { slidesPerView: 3.4, spaceBetween: 18 },
              1280: { slidesPerView: 4, spaceBetween: 20 },
            }}
            className="sold-swiper"
          >
            {vehicles.map((vehicle, i) => {
              const make = vehicle.vehicle?.make || vehicle.vehicle?.standard?.make || ''
              const model = vehicle.vehicle?.model || vehicle.vehicle?.standard?.model || ''
              const derivative = vehicle.vehicle?.derivative || vehicle.vehicle?.standard?.derivative || ''
              const year = vehicle.vehicle?.yearOfManufacture
              const mileage = vehicle.vehicle?.odometerReadingMiles
              const fuelType = vehicle.vehicle?.fuelType || vehicle.vehicle?.standard?.fuelType || ''
              const price =
                vehicle.adverts?.forecourtPrice?.amountGBP ??
                vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP ??
                null
              const imageUrl =
                vehicle.media?.images?.[0]?.href ||
                'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'
              const slug = generateVehicleSlug(vehicle)

              return (
                <SwiperSlide key={vehicle.metadata?.stockId || `${slug}-${i}`}>
                  <Link href={`/used-cars/${slug}`} className="block group outline-none">
                    <div className="bg-zinc-900 border border-zinc-700 overflow-hidden group-hover:border-zinc-500 transition-colors duration-300">

                      {/* Image */}
                      <div className="relative h-44 overflow-hidden bg-zinc-800">
                        {/* Blurred bg fill */}
                        <div
                          className="absolute inset-0 scale-110 blur-lg"
                          style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                        <img
                          src={imageUrl}
                          alt={`${make} ${model}`}
                          className="relative z-10 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Darken overlay */}
                        <div className="absolute inset-0 z-20 bg-black/50" />
                        {/* SOLD stamp */}
                        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                          <div className="border-2 border-red-500 px-5 py-1.5 -rotate-12">
                            <span className="text-base font-black uppercase tracking-[0.25em] text-red-400 drop-shadow-lg">
                              SOLD
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card info */}
                      <div className="px-3.5 py-3 border-t border-zinc-700">
                        <p className="text-sm font-black uppercase tracking-wide leading-tight text-white truncate">
                          {make} {model}
                        </p>
                        {derivative && (
                          <p className="text-[11px] text-zinc-500 truncate mt-0.5">{derivative}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          {year && (
                            <span className="text-[10px] border border-zinc-600 text-zinc-400 px-2 py-0.5 font-semibold">
                              {year}
                            </span>
                          )}
                          {mileage && (
                            <span className="text-[10px] border border-zinc-600 text-zinc-400 px-2 py-0.5 font-semibold">
                              {new Intl.NumberFormat('en-GB').format(mileage)}mi
                            </span>
                          )}
                          {fuelType && (
                            <span className="text-[10px] border border-zinc-600 text-zinc-400 px-2 py-0.5 font-semibold">
                              {fuelType}
                            </span>
                          )}
                        </div>

                        {price && (
                          <p className="mt-2.5 text-sm font-bold text-zinc-500 line-through">
                            {formatPrice(price)}
                          </p>
                        )}
                      </div>

                      {/* Blue hover accent line */}
                      <div className="h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full" />
                    </div>
                  </Link>
                </SwiperSlide>
              )
            })}
          </Swiper>
        )}

        {/* No data state */}
        {!loading && vehicles.length === 0 && (
          <p className="text-center text-zinc-600 py-12 text-sm uppercase tracking-widest font-semibold">
            No sold vehicles to display
          </p>
        )}

        {/* Mobile nav row */}
        {!loading && vehicles.length > 0 && (
          <div className="flex items-center justify-end gap-2 lg:hidden mt-4">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Previous"
              className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:border-blue-500 hover:text-blue-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Next"
              className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:border-blue-500 hover:text-blue-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .sold-swiper { padding-bottom: 40px !important; }
        .sold-dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          background: rgba(255,255,255,0.15);
          border-radius: 0;
          margin: 0 3px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .sold-dot-active {
          background: #3b82f6;
          width: 22px;
        }
        .swiper-pagination { bottom: 8px !important; }
      `}</style>
    </section>
  )
}
