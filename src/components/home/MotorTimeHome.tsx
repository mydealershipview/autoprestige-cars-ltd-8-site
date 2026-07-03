'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BadgeCheck,
  Car,
  ChevronDown,
  Clock,
  ExternalLink,
  Handshake,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from 'lucide-react'

import type { DealershipInfo } from '@/types/dealership'
import type { AutoTraderVehicle } from '@/utilities/autotrader'
import { formatPrice, generateVehicleSlug } from '@/utilities/formatVehicleData'

const REVIEWS = [
  {
    title: 'Good customer service and after care',
    body: 'The team was professional, responsive, and attentive throughout the process. The buying process felt smooth and transparent.',
    author: 'Chris D',
    date: 'April 2026',
  },
  {
    title: 'Great first car experience',
    body: 'The whole process was smooth and hassle-free from start to finish. The team were helpful and showed me a wide range of stock.',
    author: 'Mohsen Q',
    date: 'March 2026',
  },
  {
    title: 'Amazing service',
    body: 'Really nice and polite, answered every question we had when visiting the car, and made the purchase quick and friendly.',
    author: 'Sophie G',
    date: 'March 2025',
  },
  {
    title: 'Fantastic experience',
    body: 'Helpful, friendly, and knowledgeable staff with a no-pressure approach. Great customer service from first enquiry to handover.',
    author: 'Ethan E',
    date: 'March 2025',
  },
]

const FALLBACK_HOURS = [
  ['Monday', '10:00 - 17:00'],
  ['Tuesday', '10:00 - 17:00'],
  ['Wednesday', '10:00 - 17:00'],
  ['Thursday', '10:00 - 17:00'],
  ['Friday', '10:00 - 17:00'],
  ['Saturday', '10:00 - 17:00'],
  ['Sunday', '10:00 - 17:00'],
]

type Props = {
  dealership: DealershipInfo
}

const sanitizePhoneForTel = (value: string) => value.replace(/\s+/g, '')

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) {
      setCount(0)
      return
    }

    const steps = 40
    const increment = target / steps
    let current = 0
    const interval = window.setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        window.clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => window.clearInterval(interval)
  }, [duration, target])

  return count
}

function getVehiclePrice(vehicle: AutoTraderVehicle) {
  return (
    vehicle.adverts?.forecourtPrice?.amountGBP ??
    vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP ??
    vehicle.forecourtPrice?.amountGBP ??
    null
  )
}

function VehicleCard({ vehicle }: { vehicle: AutoTraderVehicle }) {
  const make = vehicle.vehicle?.make || vehicle.vehicle?.standard?.make || ''
  const model = vehicle.vehicle?.model || vehicle.vehicle?.standard?.model || ''
  const year = vehicle.vehicle?.yearOfManufacture
  const mileage = vehicle.vehicle?.odometerReadingMiles
  const fuelType = vehicle.vehicle?.fuelType || vehicle.vehicle?.standard?.fuelType || ''
  const price = getVehiclePrice(vehicle)
  const imageUrl = vehicle.media?.images?.[0]?.href
  const slug = generateVehicleSlug(vehicle)

  return (
    <Link
      href={`/usedcars/${slug}`}
      className="block overflow-hidden rounded-xl bg-[#1c1c1c] transition-all hover:ring-1 hover:ring-[#c8e63c]/40 group"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#111]">
        <div className="absolute left-3 top-3 z-10 rounded bg-[#c8e63c] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-black">
          In stock
        </div>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${make} ${model}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Car className="h-12 w-12 text-gray-700" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-0.5 text-xs uppercase tracking-wider text-gray-400">{make}</div>
        <h3 className="mb-2 text-lg font-bold leading-tight text-white">{model}</h3>
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
          {year ? <span>{year}</span> : null}
          {mileage ? (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-600" />
              <span>{Number(mileage).toLocaleString('en-GB')} mi</span>
            </>
          ) : null}
          {fuelType ? (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-600" />
              <span>{fuelType}</span>
            </>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xl font-bold text-[#c8e63c]">{formatPrice(price)}</span>
          <span className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors group-hover:border-[#c8e63c] group-hover:text-[#c8e63c]">
            View Details
          </span>
        </div>
      </div>
    </Link>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-black text-[#c8e63c]">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</div>
    </div>
  )
}

function EnquiryForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    interest: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const [firstName, ...rest] = form.name.trim().split(/\s+/)
    const lastName = rest.join(' ')

    try {
      await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'general',
          personal: {
            firstName,
            lastName,
            email: form.email,
            phone: form.phone,
          },
          message: [form.interest, form.message].filter(Boolean).join('\n\n'),
        }),
      })
    } finally {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#1a1a1a] p-8 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#c8e63c]/20">
          <Star className="h-6 w-6 text-[#c8e63c]" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-white">Enquiry sent</h3>
        <p className="text-sm text-gray-400">Thank you for getting in touch. We will respond as soon as possible.</p>
      </div>
    )
  }

  return (
    <div className="rounded-[18px] border border-white/10 bg-[#191919] p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] sm:p-8">
      <h3 className="mb-7 text-lg font-black text-white">Send an Enquiry</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Your Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="John Smith"
            className="h-12 w-full rounded-xl border border-white/10 bg-[#101010] px-4 text-sm font-semibold text-white placeholder:text-slate-700 focus:border-[#c8e63c] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="07700 000000"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#101010] px-4 text-sm font-semibold text-white placeholder:text-slate-700 focus:border-[#c8e63c] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Email Address *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="john@example.com"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#101010] px-4 text-sm font-semibold text-white placeholder:text-slate-700 focus:border-[#c8e63c] focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">I'm Interested In...</label>
          <select
            value={form.interest}
            onChange={(event) => setForm((current) => ({ ...current, interest: event.target.value }))}
            className="h-12 w-full rounded-xl border border-white/10 bg-[#101010] px-4 text-sm font-semibold text-white focus:border-[#c8e63c] focus:outline-none"
          >
            <option value="">Select an option</option>
            <option value="Buying a car">Buying a car</option>
            <option value="Part exchange">Part exchange</option>
            <option value="Finance options">Finance options</option>
            <option value="General enquiry">General enquiry</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Message</label>
          <textarea
            rows={4}
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            placeholder="Tell us what you are looking for..."
            className="min-h-32 w-full resize-none rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-700 focus:border-[#c8e63c] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="h-14 w-full rounded-xl bg-[#c8e63c] text-sm font-black uppercase tracking-wider text-black transition-colors hover:bg-[#b8d632]"
        >
          Send Enquiry
        </button>
        <p className="text-center text-xs font-semibold text-slate-700">
          We'll respond within 24 hours. Your details are kept private.
        </p>
      </form>
    </div>
  )
}

export function MotorTimeHome({ dealership }: Props) {
  const [vehicles, setVehicles] = useState<AutoTraderVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const stockCount = useCountUp(vehicles.length)

  const displayName = dealership.name || 'Motor Time Group'
  const phone = dealership.phone || '07441 940552'
  const email = dealership.email || 'info@dealership.co.uk'
  const addressLines = [
    dealership.address.line1,
    dealership.address.line2,
    dealership.address.city,
    dealership.address.postcode,
  ].filter(Boolean)
  const directionsQuery = encodeURIComponent(addressLines.join(' '))
  const logo = '/logo2.png'

  useEffect(() => {
    fetch('/api/listings?pageSize=9&sortBy=dateAdded&sortOrder=desc')
      .then((response) => response.json())
      .then((data) => setVehicles(data.results || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false))
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <main className="motor-time-home min-h-screen bg-[#111] text-white">
      <style jsx global>{`
        body > header,
        body > nav,
        body > footer {
          display: none !important;
        }

        .motor-time-home + footer {
          display: none !important;
        }
      `}</style>

      <nav className="motor-time-nav fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#111]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-24 items-center justify-between">
            <Link href="/" className="flex h-20 w-56 items-center overflow-hidden sm:w-64 lg:w-72">
              <img src={logo} alt={displayName} className="h-full w-full scale-150 object-cover object-center" />
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              <Link href="/usedcars" className="rounded px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-300 transition-colors hover:bg-white/5 hover:text-white">
                Our Stock
              </Link>
              {['about', 'finance', 'part-exchange', 'warranty', 'contact'].map((id) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="rounded px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {id === 'warranty' ? 'Warranty' : id.replace('-', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a href={`tel:${sanitizePhoneForTel(phone)}`} className="hidden items-center gap-1.5 text-sm font-semibold text-[#c8e63c] sm:flex">
                <Phone className="h-3.5 w-3.5" />
                {phone}
              </a>
              <button
                onClick={() => scrollTo('contact')}
                className="rounded bg-[#c8e63c] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-[#b8d632]"
              >
                Enquire Now
              </button>
              <button className="text-gray-400 hover:text-white md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {menuOpen ? (
            <div className="space-y-1 border-t border-white/5 py-3 md:hidden">
              <Link href="/usedcars" onClick={() => setMenuOpen(false)} className="block rounded px-2 py-2 text-sm font-semibold uppercase tracking-wider text-gray-300 transition-colors hover:bg-white/5 hover:text-white">
                Our Stock
              </Link>
              {['about', 'finance', 'part-exchange', 'warranty', 'contact'].map((id) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="block w-full rounded px-2 py-2 text-left text-sm font-semibold uppercase tracking-wider text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {id === 'warranty' ? 'Warranty' : id.replace('-', ' ')}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </nav>

      <section className="relative flex min-h-screen items-end overflow-hidden pb-24">
        <div className="absolute inset-0">
          <img src="/hero_showroom.jpg" alt={`${displayName} showroom`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/60 to-[#111]/20" />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
            Family-run dealership - {dealership.address.city || 'United Kingdom'}
          </div>
          <h1 className="mb-2 text-5xl font-black uppercase leading-none sm:text-7xl">Cars Worth</h1>
          <h2 className="mb-6 text-5xl font-black uppercase leading-none text-[#c8e63c] sm:text-7xl">Your Time.</h2>
          <p className="mb-8 max-w-xl text-lg text-gray-300">
            Hand-picked quality used cars, prepared to retail-ready standard. No pressure, no admin fees, just a genuine buying experience.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => scrollTo('our-stock')} className="rounded bg-[#c8e63c] px-6 py-3 font-bold uppercase tracking-wider text-black transition-colors hover:bg-[#b8d632]">
              Browse Our Stock
            </button>
            <button onClick={() => scrollTo('contact')} className="rounded border border-white/30 px-6 py-3 font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white/5">
              Get In Touch
            </button>
          </div>
        </div>
        <button onClick={() => scrollTo('our-stock')} className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-gray-500 transition-colors hover:text-white">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </button>
      </section>

      <section className="bg-[#c8e63c] py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Sparkles, title: 'No Admin Fees', sub: 'What you see is what you pay.' },
              { icon: Search, title: 'Multi-Point Inspected', sub: 'Every car checked before it reaches the forecourt.' },
              { icon: Handshake, title: 'One-to-One Service', sub: 'No pressure. Your time, your pace.' },
            ].map((usp) => (
              <div key={usp.title} className="flex items-center gap-3">
                <usp.icon className="h-7 w-7 text-black" />
                <div>
                  <div className="text-sm font-bold text-black">{usp.title}</div>
                  <div className="text-xs text-black/60">{usp.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#161616] py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:grid-cols-4 sm:px-6 lg:px-8">
          <Stat value={`${stockCount}+`} label="Cars In Stock" />
          <Stat value="4+" label="Star Reviews" />
          <Stat value="Zero" label="Admin Fees" />
          <Stat value="7 Days" label="Open Every Week" />
        </div>
      </section>

      <section id="our-stock" className="bg-[#111] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Current Inventory</div>
              <h2 className="text-4xl font-black uppercase">Featured Stock</h2>
              <p className="mt-2 max-w-lg text-sm text-gray-400">
                Every vehicle is hand-picked and prepared with care before reaching our forecourt.
              </p>
            </div>
            <Link href="/usedcars" className="hidden items-center gap-2 rounded border border-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:border-[#c8e63c] hover:text-[#c8e63c] sm:flex">
              View All Stock
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-xl bg-[#1c1c1c]">
                  <div className="aspect-[4/3] animate-pulse bg-white/5" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                    <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Car className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Stock coming soon. Check back shortly or contact us for the latest arrivals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.metadata?.stockId || vehicle.registration} vehicle={vehicle} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/usedcars" className="inline-flex items-center gap-2 rounded bg-[#c8e63c] px-6 py-3 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-[#b8d632]">
              View All Stock
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="bg-[#161616] py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Who We Are</div>
            <h2 className="mb-6 text-4xl font-black uppercase leading-tight">
              A Business<br />
              <span className="text-[#c8e63c]">Built on Trust</span>
            </h2>
            <p className="mb-6 leading-relaxed text-gray-300">
              {displayName} focuses on quality over quantity, with carefully prepared vehicles and a straightforward, honest buying experience.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ['Hand-Picked Stock', 'Every car is selected and prepared to a retail-ready standard.'],
                ['Multi-Point Inspection', 'Full health checks so you can buy with confidence.'],
                ['No Pressure', 'A genuine buying experience at your pace.'],
                ['Part Exchange Welcome', 'Competitive valuations on your current vehicle.'],
                ['Trusted Finance Partners', 'Support finding the right payment solution.'],
                ['Appointment and Walk-In', 'Contact us to arrange a viewing.'],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3">
                  <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#c8e63c]" />
                  <div>
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="mt-0.5 text-xs text-gray-500">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img src="/hero_showroom.jpg" alt={`${displayName} vehicles`} className="aspect-[4/3] w-full rounded-2xl object-cover" />
            <div className="absolute -bottom-4 -left-4 rounded-xl bg-[#c8e63c] px-5 py-3 text-black">
              <div className="text-2xl font-black">{vehicles.length > 0 ? `${vehicles.length}+` : '20+'}</div>
              <div className="text-xs font-semibold uppercase tracking-wide">Cars in Stock</div>
            </div>
          </div>
        </div>
      </section>

      <section id="finance" className="bg-[#111] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">How We Can Help</div>
            <h2 className="text-4xl font-black uppercase">Finance and Part Exchange</h2>
          </div>
          <div id="part-exchange" className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                title: 'Trusted Finance Partners',
                body: 'We can help you explore payment options through carefully selected finance partners.',
                cta: 'Enquire About Finance',
                href: '/finance',
                items: ['Competitive rates from trusted lenders', 'Flexible terms to suit your budget', 'Quick decisions', 'Straightforward process'],
              },
              {
                title: 'Part Exchange Welcome',
                body: 'Trade in your current car and make upgrading to your next vehicle simpler.',
                cta: 'Get a Valuation',
                href: '/valuation',
                items: ['Market-aligned valuations', 'All makes and models considered', 'Offset your next purchase', 'Simple no-obligation assessment'],
              },
            ].map((section) => (
              <div key={section.title} className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-8">
                <h3 className="mb-4 text-xl font-bold">{section.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-400">{section.body}</p>
                <ul className="mb-6 space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                      <BadgeCheck className="h-4 w-4 flex-shrink-0 text-[#c8e63c]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={section.href} className="inline-flex rounded bg-[#c8e63c] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-[#b8d632]">
                  {section.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="warranty" className="bg-[#111] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a]">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="flex flex-col justify-center p-8 lg:p-10">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Warranty Support</div>
                <ShieldCheck className="mb-5 h-12 w-12 text-[#c8e63c]" />
                <h2 className="mb-4 text-3xl font-black uppercase leading-tight">
                  Drive Away With <span className="text-[#c8e63c]">Peace of Mind.</span>
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-gray-300">
                  Eligible vehicles can be supplied with warranty cover, helping protect you from unexpected repair costs after purchase.
                </p>
                <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    ['Mechanical and electrical cover', 'Protection against unexpected repair bills.'],
                    ['Car hire and onward travel', 'Support when you need to keep moving.'],
                    ['Repair support', 'Help when problems need professional attention.'],
                    ['Clear documentation', 'Plan details provided before you commit.'],
                  ].map(([title, desc]) => (
                    <div key={title} className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#c8e63c]" />
                      <div>
                        <div className="text-xs font-semibold text-white">{title}</div>
                        <div className="mt-0.5 text-xs text-gray-500">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => scrollTo('contact')} className="w-fit rounded bg-[#c8e63c] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-[#b8d632]">
                  Ask About Warranty
                </button>
              </div>
              <div className="flex flex-col justify-center border-t border-white/10 bg-[#c8e63c]/5 p-8 lg:border-l lg:border-t-0 lg:p-10">
                <div className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Why It Matters</div>
                <div className="space-y-5">
                  {[
                    ['Prepared', 'Vehicles checked before sale.'],
                    ['Protected', 'Warranty options available on eligible vehicles.'],
                    ['Supported', 'Clear aftercare and contact routes.'],
                    ['Straightforward', 'No-pressure explanation of available cover.'],
                  ].map(([stat, label]) => (
                    <div key={stat} className="grid gap-2 sm:grid-cols-[minmax(190px,220px)_1fr] sm:items-start sm:gap-6">
                      <div className="min-w-0 text-2xl font-black leading-tight text-[#c8e63c]">{stat}</div>
                      <div className="min-w-0 pt-1 text-sm font-semibold leading-relaxed text-white">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#161616] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">What Our Customers Say</div>
            <h2 className="text-4xl font-black uppercase">Customer Reviews</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REVIEWS.map((review) => (
              <div key={review.title} className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-[#c8e63c] text-[#c8e63c]" />
                  ))}
                </div>
                <h4 className="mb-2 text-sm font-bold text-white">{review.title}</h4>
                <p className="mb-4 text-xs leading-relaxed text-gray-400">{review.body}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-300">{review.author}</span>
                  <span className="text-xs text-gray-600">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="border-b border-white/5 bg-[#111] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-gray-600">Get In Touch</div>
            <h2 className="text-4xl font-black uppercase leading-tight sm:text-5xl">Visit Us or Enquire Online</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-[#191919] p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] sm:p-8">
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <MapPin className="mt-1 h-6 w-6 flex-shrink-0 text-[#c8e63c]" />
                  <div>
                    <div className="mb-3 text-lg font-black text-white">Address</div>
                    <div className="text-base font-semibold leading-relaxed text-gray-500">{addressLines.length ? addressLines.map((line) => <div key={line}>{line}</div>) : 'Address available on request'}</div>
                    {directionsQuery ? (
                      <a href={`https://maps.google.com/?q=${directionsQuery}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-black text-[#c8e63c] hover:underline">
                        Get Directions <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <Phone className="mt-1 h-6 w-6 flex-shrink-0 text-[#c8e63c]" />
                  <div>
                    <div className="mb-3 text-lg font-black text-white">Phone / WhatsApp</div>
                    <a href={`tel:${sanitizePhoneForTel(phone)}`} className="text-base font-semibold text-gray-500 transition-colors hover:text-[#c8e63c]">{phone}</a>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <Clock className="mt-1 h-6 w-6 flex-shrink-0 text-[#c8e63c]" />
                  <div className="w-full">
                    <div className="mb-4 text-lg font-black text-white">Opening Hours</div>
                    <div className="space-y-1.5">
                      {FALLBACK_HOURS.map(([day, hours]) => (
                        <div key={day} className="flex justify-between gap-8 text-base font-semibold leading-tight">
                          <span className="text-gray-500">{day}</span>
                          <span className="text-right text-gray-300">{hours}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-5 text-xs font-semibold text-slate-700">Viewings by appointment preferred. Walk-ins welcome.</p>
                  </div>
                </div>
              </div>
            </div>
            <EnquiryForm />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-[#0d0d0d] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <img src={logo} alt={displayName} className="mb-3 h-8 w-auto max-w-[220px] object-contain" />
              <p className="text-xs leading-relaxed text-gray-500">
                Family-run car dealership offering hand-picked quality used cars, prepared to retail-ready standard.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#c8e63c]">No Admin Fees</span>
                <span className="text-gray-700">|</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#c8e63c]">Part Exchange</span>
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-white">Quick Links</div>
              <div className="space-y-1.5">
                <Link href="/usedcars" className="block text-xs text-gray-500 transition-colors hover:text-gray-300">Our Stock</Link>
                {['about', 'finance', 'part-exchange', 'warranty', 'contact'].map((id) => (
                  <button key={id} onClick={() => scrollTo(id)} className="block text-xs capitalize text-gray-500 transition-colors hover:text-gray-300">
                    {id === 'warranty' ? 'Warranty' : id.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-white">Contact</div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <a href={`tel:${sanitizePhoneForTel(phone)}`} className="block hover:text-gray-300">{phone}</a>
                {addressLines.map((line) => <div key={line}>{line}</div>)}
              </div>
            </div>
          </div>
          <div className="space-y-1.5 border-t border-white/5 pt-6">
            <p className="text-xs text-gray-700">
              &copy; {new Date().getFullYear()} {displayName}. All Rights Reserved.
            </p>
            <p className="text-xs text-gray-700">
              Finance and warranty products are subject to status, eligibility, terms, and conditions. Please ask for full details before purchase.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
