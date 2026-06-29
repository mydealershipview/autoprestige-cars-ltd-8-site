'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AutoTraderVehicle } from '@/utilities/autotrader'
import { formatPrice, generateVehicleSlug } from '@/utilities/formatVehicleData'

type SoldVehiclesShowcaseProps = {
  vehicles: AutoTraderVehicle[]
}

export default function SoldVehiclesShowcase({ vehicles }: SoldVehiclesShowcaseProps) {
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const swiperRef = useRef<SwiperType | null>(null)

  const handleSwiper = (swiper: SwiperType) => {
    swiperRef.current = swiper
    if (prevRef.current && nextRef.current) {
      // @ts-expect-error Swiper accepts HTMLElement refs at runtime.
      swiper.params.navigation.prevEl = prevRef.current
      // @ts-expect-error Swiper accepts HTMLElement refs at runtime.
      swiper.params.navigation.nextEl = nextRef.current
      swiper.navigation.destroy()
      swiper.navigation.init()
      swiper.navigation.update()
    }
  }

  return (
    <>
      <div className="mb-3 hidden justify-end gap-2 sm:flex">
        <button
          ref={prevRef}
          aria-label="Previous sold vehicle"
          className="flex h-9 w-9 items-center justify-center rounded border border-white/10 text-gray-300 !transition-colors hover:border-blue-400/60 hover:text-blue-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          ref={nextRef}
          aria-label="Next sold vehicle"
          className="flex h-9 w-9 items-center justify-center rounded border border-white/10 text-gray-300 !transition-colors hover:border-blue-400/60 hover:text-blue-300"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        onSwiper={handleSwiper}
        slidesPerView={1.15}
        spaceBetween={12}
        loop={vehicles.length >= 5}
        autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        pagination={{
          clickable: true,
          bulletClass: 'showcase-sold-dot',
          bulletActiveClass: 'showcase-sold-dot-active',
        }}
        breakpoints={{
          640: { slidesPerView: 2.1, spaceBetween: 14 },
          1024: { slidesPerView: 3.1, spaceBetween: 16 },
          1440: { slidesPerView: 4.1, spaceBetween: 16 },
        }}
        className="showcase-sold-swiper"
      >
        {vehicles.map((vehicle, index) => {
          const make = vehicle.vehicle?.make || vehicle.vehicle?.standard?.make || ''
          const model = vehicle.vehicle?.model || vehicle.vehicle?.standard?.model || ''
          const derivative = vehicle.vehicle?.derivative || vehicle.vehicle?.standard?.derivative || ''
          const year = vehicle.vehicle?.yearOfManufacture
          const mileage = vehicle.vehicle?.odometerReadingMiles
          const fuelType = vehicle.vehicle?.fuelType || vehicle.vehicle?.standard?.fuelType || ''
          const price =
            vehicle.adverts?.soldPrice?.amountGBP ??
            vehicle.adverts?.forecourtPrice?.amountGBP ??
            vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP ??
            null
          const imageUrl =
            vehicle.media?.images?.[0]?.href ||
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'
          const slug = generateVehicleSlug(vehicle)

          return (
            <SwiperSlide key={vehicle.metadata?.stockId || `${slug}-${index}`}>
              <Link
                href={`/usedcars/${slug}`}
                className="group block overflow-hidden rounded border border-white/10 bg-[#181818] !transition-colors hover:border-blue-400/50"
              >
                <div className="relative h-44 overflow-hidden bg-[#111]">
                  <div
                    className="absolute inset-0 scale-110 bg-cover bg-center opacity-70 blur-lg"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                  <img
                    src={imageUrl}
                    alt={`${make} ${model}`}
                    className="relative z-10 h-full w-full object-contain object-center !transition-transform !duration-500 group-hover:scale-[1.03]"
                    width="800"
                    height="600"
                    loading="lazy"
                  />
                </div>
                <div className="px-3 py-3">
                  <p className="truncate text-sm font-extrabold uppercase tracking-wide text-white">
                    {make} {model}
                  </p>
                  {derivative && (
                    <p className="mt-0.5 truncate text-[10px] text-gray-500">{derivative}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {year && (
                      <span className="rounded-sm border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-gray-300">
                        {year}
                      </span>
                    )}
                    {mileage != null && (
                      <span className="rounded-sm border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-gray-300">
                        {new Intl.NumberFormat('en-GB').format(mileage)}mi
                      </span>
                    )}
                    {fuelType && (
                      <span className="rounded-sm border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-gray-300">
                        {fuelType}
                      </span>
                    )}
                  </div>
                  {price && (
                    <p className="mt-2.5 text-sm font-bold text-gray-500 line-through">
                      {formatPrice(price)}
                    </p>
                  )}
                </div>
                <div className="h-0.5 w-0 bg-blue-500 !transition-all !duration-300 group-hover:w-full" />
              </Link>
            </SwiperSlide>
          )
        })}
      </Swiper>

      <div className="mt-4 flex justify-end gap-2 sm:hidden">
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Previous sold vehicle"
          className="flex h-9 w-9 items-center justify-center rounded border border-white/10 text-gray-300 !transition-colors hover:border-blue-400/60 hover:text-blue-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Next sold vehicle"
          className="flex h-9 w-9 items-center justify-center rounded border border-white/10 text-gray-300 !transition-colors hover:border-blue-400/60 hover:text-blue-300"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <style>{`
        .showcase-sold-swiper { padding-bottom: 28px !important; }
        .showcase-sold-dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          background: rgba(255,255,255,0.16);
          border-radius: 0;
          margin: 0 3px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .showcase-sold-dot-active {
          background: #3b82f6;
          width: 22px;
        }
        .showcase-sold-swiper .swiper-pagination { bottom: 4px !important; }
      `}</style>
    </>
  )
}
