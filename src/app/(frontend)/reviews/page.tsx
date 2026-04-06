import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getDealershipInfo } from '@/lib/services/dealership.service'

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

const testimonials = [
  {
    name: 'Mark R',
    text: 'Very good experience, easy and relaxed process from initial enquiries to vehicle collection. Thank you to the team.',
    rating: 5,
  },
  {
    name: 'Ben H',
    text: 'Very helpful and friendly staff. Very clean and tidy showroom with some amazing cars for sale and not badly priced.',
    rating: 5,
  },
  {
    name: 'Waquas A',
    text: "I would like to thank the team for the service provided when purchasing my new vehicle. I highly recommend and will most definitely be returning for my next vehicle. Thanks guys!",
    rating: 5,
  },
  {
    name: 'Frankie',
    text: "Brilliant customer service today, came in looking for a C63 and had a nice friendly chat, can't wait to pick it up tomorrow thanks guys :)",
    rating: 5,
  },
  {
    name: 'Paul G',
    text: "Top class service from the second I walked in, bought a 1 year old RS3 at a very competitive price. The showroom is incredible! Highly recommend these lads.",
    rating: 5,
  },
  {
    name: 'Damien J',
    text: 'Top service, top company and top choice of vehicles. Always purchase my cars here. I will highly recommend this company.',
    rating: 5,
  },
  {
    name: 'Tom R',
    text: 'Highly professional, courteous and easy to deal with. Sold a car to them and got a great price.',
    rating: 5,
  },
  {
    name: 'Abdi',
    text: "Fantastic service, genuinely unbeatable! The nicest car dealers I have ever met. Will be coming here again soon for a new present.",
    rating: 5,
  },
  {
    name: 'Christian C',
    text: 'Great service from staff, got a brand new car with a decent deal.',
    rating: 5,
  },
  {
    name: 'Sarah M',
    text: 'Absolutely fantastic from start to finish. Nothing was too much trouble and the whole experience was seamless. Would 100% recommend.',
    rating: 5,
  },
  {
    name: 'James K',
    text: 'Excellent selection of vehicles and knowledgeable staff. The whole buying process was transparent and stress-free. Very happy with my purchase.',
    rating: 5,
  },
  {
    name: 'Lisa T',
    text: 'Genuinely impressed by the level of service. The team went above and beyond to help me find the right car within my budget. Could not ask for more.',
    rating: 5,
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex justify-center gap-1 mb-3">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.062 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      ))}
    </div>
  )
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
          <div className="w-16 h-1 bg-red-600 mx-auto" />
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
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="border border-white/20 p-8 flex flex-col items-center text-center hover:border-red-600 !transition-colors !duration-300"
            >
              <StarRating count={t.rating} />
              <div className="w-12 h-0.5 bg-red-600 mb-5" />
              <p className="text-white/85 text-sm leading-relaxed flex-1 mb-6">{t.text}</p>
              <p className="font-black tracking-widest text-sm uppercase">{t.name}</p>
            </div>
          ))}
        </div>

        {/* Google Reviews CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/60 text-sm mb-4">Want to share your experience?</p>
          <a
            href="https://g.page/r/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest uppercase text-sm px-8 py-4 !transition-colors"
          >
            Leave a Google Review
          </a>
        </div>
      </div>
    </div>
  )
}
