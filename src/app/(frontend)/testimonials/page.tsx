import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getDealershipInfo } from '@/lib/services/dealership.service'
import { StarRating } from '@/components/StarRating'
import { GOOGLE_REVIEW_URL, TESTIMONIALS } from '@/data/testimonials'

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Customer Reviews & Testimonials | ${dealership.name}`,
    description:
      'Read genuine customer reviews and testimonials. See what our customers say about our quality vehicles, exceptional service, and professional team.',
    openGraph: {
      title: `Customer Reviews & Testimonials | ${dealership.name}`,
      description: 'Read what our customers say - real testimonials from real buyers.',
      type: 'website',
      locale: 'en_GB',
    },
  }
}

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[380px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/car_4.jpg"
          alt="Cars in showroom"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/65" />
        {/* Decorative diagonal stripes */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-24 bg-white"
              style={{
                left: `${i * 16 - 5}%`,
                transform: 'skewX(-20deg)',
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-[0.2em] uppercase mb-4">
            TESTIMONIALS
          </h1>
          <div className="w-16 h-1 bg-blue-500 mx-auto" />
        </div>
      </div>

      {/* Intro */}
      <div className="py-16 px-4 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-6">
          WHAT OUR CUSTOMERS SAY
        </h2>
        <p className="font-semibold text-white/90 mb-2">
          See some of our testimonials from previous happy customers.
        </p>
        <p className="text-white/70 text-sm">
          Below is just a snippet of the reviews we receive from our customers over the past few years.
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="border border-white/20 p-8 flex flex-col items-center text-center hover:border-blue-500 !transition-colors !duration-300"
            >
              <StarRating count={t.rating} />
              <div className="w-12 h-0.5 bg-blue-500 mb-5" />
              <p className="text-white/85 text-sm leading-relaxed flex-1 mb-6">{t.text}</p>
              <p className="font-black tracking-widest text-sm uppercase">{t.name}</p>
            </div>
          ))}
        </div>

        {/* Google Reviews CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/60 text-sm mb-4">Want to share your experience?</p>
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0c6dff] hover:bg-blue-600 text-white font-bold tracking-widest uppercase text-sm px-8 py-4 !transition-colors"
          >
            Leave a Google Review
          </a>
        </div>
      </div>
    </div>
  )
}
