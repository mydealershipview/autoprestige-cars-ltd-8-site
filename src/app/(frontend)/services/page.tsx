import React from 'react'
import type { Metadata } from 'next'
import ServiceBookingForm from './_components/ServiceBookingForm'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Our Services | ${dealership.name}`,
    description:
      'Discover our range of specialist automotive services including alloy wheel refurbishment, privacy glass, full vehicle resprays, and custom styling. Book your service today.',
    openGraph: {
      title: `Our Services | ${dealership.name}`,
      description:
        'Expert automotive services including alloy wheels, privacy glass, resprays and custom styling. Book online today.',
      type: 'website',
      locale: 'en_GB',
    },
  }
}

const services = [
  {
    title: 'Customise Your Car With Style',
    description:
      'Stamp your car with your own personal touch – give it the individuality it deserves and make it extra special to stand out from the clones – SSC can now customise your vehicle for you.',
    image: '/car_7.jpg',
  },
  {
    title: 'Alloy Wheels',
    description:
      'Alloy wheels can dramatically change your cars overall appearance. We have a wide range of brand new alloy wheels from 16" to 22" on offer and you can even complete the look with the tyres that we have available to suit your chosen alloy wheel size. What\'s more, we will also professionally fit them for you.',
    image: '/car_2.jpg',
  },
  {
    title: 'Privacy Glass',
    description:
      'Privacy glass and window tinting enhance your vehicle\'s safety and style while protecting against sun damage and reducing interior fading. Our professional fitting team ensures a flawless installation that seamlessly matches factory tints. We provide expert advice on the best shade to complement your car\'s appearance and meet your needs for privacy and security.',
    image: '/car_3.jpg',
  },
  {
    title: 'Alloy Wheel Refurb',
    description:
      'With our complete refurbishment process we can also transform alloy wheels from the usual wear and tear back in to immaculate condition looking as good as new keeping your car prestige looking.',
    image: '/car_4.jpg',
  },
  {
    title: 'Full Vehicle Resprays',
    description:
      'We also have professional re-spray facilities — we are highly equipped to re-spray vehicles and re-spray cars to be colour code i.e. to moulding, bumpers etc. If you are interested in any of the services above, give us a call for a friendly chat where we can discuss your requirements and provide you with a quote.',
    image: '/car_5.jpg',
  },
]

const ServiceCard = ({ service }: { service: (typeof services)[number] }) => (
  <div className="relative flex flex-col items-center justify-center text-center px-10 py-16 overflow-hidden min-h-[340px] group">
    <div
      className="absolute inset-0 bg-cover bg-center !transition-transform !duration-700 group-hover:scale-105"
      style={{ backgroundImage: `url('${service.image}')` }}
    />
    <div className="absolute inset-0 bg-black/65 group-hover:bg-black/50 !transition-colors !duration-300" />
    <div className="relative z-10">
      <h3 className="text-base md:text-lg font-black tracking-widest uppercase text-white mb-2">
        {service.title}
      </h3>
      <div className="h-[2px] w-12 bg-blue-500 mx-auto mb-4" />
      <p className="text-white/75 text-sm leading-relaxed max-w-xs mx-auto">
        {service.description}
      </p>
    </div>
  </div>
)

const AccentBar = () => (
  <div className="flex items-center justify-center gap-0 mx-auto w-32 mt-3">
    <div className="h-[3px] flex-1 bg-blue-500" />
    <div className="w-4 h-4 bg-blue-500 rotate-45 -mx-1" />
    <div className="h-[3px] flex-1 bg-blue-500" />
  </div>
)

export default function ServicesPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* ─── HERO ─── */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: '52vh', paddingTop: '5rem' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/car_2.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-[0.2em] uppercase text-white mb-4">
            Our Services
          </h1>
          <AccentBar />
        </div>
      </section>

      {/* ─── INTRO ─── */}
      <section className="py-14 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-3 flex items-center justify-center gap-3 flex-wrap">
          <div className="w-5 h-5 bg-blue-500 rotate-45 inline-block shrink-0" />
          Get The Best Possible Service
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto text-sm leading-relaxed mb-3">
          Here at our dealership, we ensure that you get the best possible service, whether it be
          in branch or exporting to individuals or dealers.
        </p>
        <p className="text-white/60 max-w-2xl mx-auto text-sm leading-relaxed">
          We are proud to say that we are one of the leading traders in the UK for exporting
          vehicles and parts any where in the world. We are very competitive with our rates, can
          guarantee the best possible service, helping with export / import in total confidence and
          can deliver straight to your door.
        </p>
      </section>

      {/* ─── SERVICE CARDS ─── */}
      <section className="pb-6">
        {/* Row 1 — 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {services.slice(0, 3).map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </div>
        {/* Row 2 — 2 cards, centred */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:max-w-[66.666%] md:mx-auto w-full">
          {services.slice(3).map((service, index) => (
            <ServiceCard key={index + 3} service={service} />
          ))}
        </div>
      </section>

      {/* ─── BOOKING FORM ─── */}
      <section className="py-14 px-4">
        <p className="text-center text-white/70 text-sm max-w-2xl mx-auto mb-10">
          To book a service, simply complete the form below and a member of our friendly team will
          be in touch shortly or give us a call.
        </p>

        <div className="max-w-3xl mx-auto border border-white/10 p-8">
          <ServiceBookingForm />
        </div>
      </section>
    </div>
  )
}
