import React from 'react'
import type { Metadata } from 'next'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `RAC Warranty | ${dealership.name}`,
    description:
      'Every eligible vehicle we sell includes an RAC Warranty. 3-month maintenance and repair cover, 12 months free RAC Breakdown Cover, Car Data Check and no excess to pay.',
    openGraph: {
      title: `RAC Warranty | ${dealership.name}`,
      description:
        'Comprehensive RAC warranty protection with every eligible vehicle sold. Peace of mind driving from day one.',
      type: 'website',
      locale: 'en_GB',
    },
  }
}

const warrantyFeatures = [
  {
    title: 'RAC Maintenance and Repair Warranty',
    description:
      '3 month warranty with every eligible vehicle*. RAC Maintenance and Repair Warranty is included with all makes and models and can give you the extra reassurance in the event of something happening to your vehicle. For additional peace of mind, you can extend the term of the warranty to up to 36 months for an additional fee.',
    image: '/car_8.jpg',
  },
  {
    title: '12 Months Free RAC Breakdown Cover**',
    description:
      'Every vehicle includes free 12 months RAC Breakdown Cover, which may require activation. RAC Accident Care — Your RAC breakdown cover includes Accident Care and Motor Legal Care (for the duration of Breakdown Cover).',
    image: '/car_9.jpg',
  },
  {
    title: 'Car Data Check',
    description:
      'Evidences the vehicle you are buying is not stolen, written off or have any outstanding finance. Complete peace of mind before you drive away.',
    image: '/car_10.jpg',
  },
  {
    title: 'No Excess to Pay',
    description:
      'Unlike many warranty providers, our RAC Warranty comes with no excess payments. When something goes wrong you are fully covered with no hidden costs to worry about.',
    image: '/car_8.jpg',
  },
]

const AccentBar = () => (
  <div className="flex items-center justify-center gap-0 mx-auto w-32 mt-3">
    <div className="h-[3px] flex-1 bg-red-600" />
    <div className="w-4 h-4 bg-red-600 rotate-45 -mx-1" />
    <div className="h-[3px] flex-1 bg-red-600" />
  </div>
)

const FeatureCard = ({ feature }: { feature: (typeof warrantyFeatures)[number] }) => (
  <div className="relative flex flex-col items-center justify-center text-center px-10 py-16 overflow-hidden min-h-[340px] group">
    <div
      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
      style={{ backgroundImage: `url('${feature.image}')` }}
    />
    <div className="absolute inset-0 bg-black/70 group-hover:bg-black/55 transition-colors duration-300" />
    <div className="relative z-10">
      <h3 className="text-base md:text-lg font-black tracking-widest uppercase text-red-500 mb-2">
        {feature.title}
      </h3>
      <div className="h-[2px] w-12 bg-red-600 mx-auto mb-4" />
      <p className="text-white/80 text-sm leading-relaxed max-w-xs mx-auto">
        {feature.description}
      </p>
    </div>
  </div>
)

export default function WarrantyPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* ─── HERO ─── */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: '52vh', paddingTop: '5rem' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/car_9.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-[0.2em] uppercase text-white mb-4">
            RAC Warranty
          </h1>
          <AccentBar />
        </div>
      </section>

      {/* ─── PROUD RAC DEALER ─── */}
      <section className="py-14 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-3 flex items-center justify-center gap-3 flex-wrap">
          <div className="w-5 h-5 bg-red-600 rotate-45 inline-block shrink-0" />
          We&apos;re Proud to Be an RAC Dealer
        </h2>
        <AccentBar />
        <p className="text-white/60 max-w-2xl mx-auto text-sm leading-relaxed mt-6">
          Although we take care and pride in ensuring all our vehicles are in their best condition
          when sold, sometimes things can go wrong. We&apos;d like to offer you added peace of mind
          when driving your new vehicle. As part of the RAC Dealer Network, every eligible vehicle
          we sell includes an RAC Warranty.
        </p>
      </section>

      {/* ─── EVERY VEHICLE COMES WITH ─── */}
      <section className="pb-4 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-2 flex items-center justify-center gap-3 flex-wrap">
          <div className="w-5 h-5 bg-red-600 rotate-45 inline-block shrink-0" />
          Every Vehicle Sold Comes With:
        </h2>
        <AccentBar />
      </section>

      {/* ─── FEATURE CARDS ─── */}
      <section className="pb-6 pt-4">
        {/* Row 1 — 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {warrantyFeatures.slice(0, 3).map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
        {/* Row 2 — 1 card, centred */}
        <div className="grid grid-cols-1 md:grid-cols-1 md:max-w-[33.333%] md:mx-auto w-full">
          {warrantyFeatures.slice(3).map((feature, index) => (
            <FeatureCard key={index + 3} feature={feature} />
          ))}
        </div>
      </section>

      {/* ─── SMALL PRINT ─── */}
      <section className="py-10 px-4 border-t border-white/10">
        <p className="text-white/30 text-xs max-w-3xl mx-auto text-center leading-relaxed">
          * Subject to vehicle eligibility criteria. ** 12 Months RAC Breakdown Cover may require
          activation. Terms and conditions apply. Please ask a member of our team for full details.
        </p>
      </section>
    </div>
  )
}
