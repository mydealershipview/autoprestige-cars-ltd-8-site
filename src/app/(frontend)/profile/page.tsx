import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Profile | Autoprestige',
  description:
    'See Autoprestige profile - used prestige car dealer with dealership background, appointment details, and opening times.',
  openGraph: {
    title: 'Profile | Autoprestige',
    description:
      'Family run independent sports and prestige car specialist with over 15 years experience.',
    type: 'website',
    locale: 'en_GB',
  },
}

const openingTimes = [
  'Viewing by prior arrangement only',
  'Mon - Thur: 10am - 6pm',
  'Friday: 3pm - 6pm',
  'Saturday: 11am - 4pm',
  'Sunday: Closed',
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-6xl px-6 pt-32 pb-16">
        <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-2">
          SEE AUTOPRESTIGE PROFILE - USED PRESTIGE CAR DEALER
        </h1>
        <div className="w-16 h-1 bg-red-600 mb-10" />

        <div className="space-y-10 text-white/80">
          <section className="space-y-3">
            <h2 className="text-xl font-black tracking-wide uppercase text-white">Autoprestige</h2>
            <p className="leading-relaxed">
              Autoprestige is a family run independent sports and prestige car specialist with over
              15 years experience at selecting only the highest quality vehicles. Our reputation has
              been built on supplying only the very best used cars carefully sourced from our
              network of trade partners, our own part exchanges or purchased directly from our own
              previous customers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black tracking-wide uppercase text-white">Our Passion</h2>
            <p className="leading-relaxed">
              We are passionate about our cars as our customers, so you can be sure you are dealing
              with experienced and informed staff. We are committed to straightforward business and
              pride ourselves on the friendly and relaxed way in which our customers are treated. We
              aim to ensure that our customers come back to us whenever they are looking to change
              their car.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black tracking-wide uppercase text-white">Sales</h2>
            <p className="leading-relaxed">
              A great majority of our sales come from recommendations from existing customers. At
              Autoprestige we pride ourselves on selling the very best quality vehicles. We have
              exacting standards in the preparation and presentation of our vehicles which are all
              HPI checked prior to sale and carry either the balance of manufacturers warranty or
              with a 3 month comprehensive parts and labour warranty from our warranty partners.
              (subject to age and mileage of the vehicle)
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black tracking-wide uppercase text-white">Want an Appointment?</h2>
            <p className="leading-relaxed">
              We operate on an appointment only basis and all our vehicles can be viewed in our
              purpose built showroom which is adjacent to the Mercedes Benz dealership.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/10 pt-10">
            <article className="border border-white/10 p-6 bg-white/[0.02]">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">Contact Details</h3>
              <p className="text-sm uppercase tracking-wider text-white/60 mb-1">Telephone:</p>
              <a
                href="tel:01274488500"
                className="text-lg font-semibold text-white hover:text-red-500 transition-colors"
              >
                01274 488500
              </a>
              <div className="mt-4">
                <Link href="/contact" className="text-red-500 hover:text-red-400 underline text-sm">
                  Contact Us &gt;
                </Link>
              </div>
            </article>

            <article className="border border-white/10 p-6 bg-white/[0.02]">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">Our Location</h3>
              <p className="leading-relaxed">
                Rosse Street
                <br />
                Bradford
                <br />
                West Yorkshire
                <br />
                BD8 9AS
              </p>
              <div className="mt-4">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Rosse+Street+Bradford+West+Yorkshire+BD8+9AS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-400 underline text-sm"
                >
                  Get Directions &gt;
                </a>
              </div>
            </article>

            <article className="border border-white/10 p-6 bg-white/[0.02]">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">Opening Times</h3>
              <ul className="space-y-2">
                {openingTimes.map((entry) => (
                  <li key={entry} className="text-sm leading-relaxed">
                    {entry}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="border-t border-white/10 pt-10 space-y-3 text-sm leading-relaxed">
            <p>Autoprestige Cars - cars</p>
            <p>
              <Link href="/privacy" className="text-red-500 hover:text-red-400 underline">
                Privacy Policy
              </Link>{' '}
              |{' '}
              <Link href="/cookies" className="text-red-500 hover:text-red-400 underline">
                Cookie Policy
              </Link>
            </p>
            <p>Copyright (c) 2026 Autoprestige Cars. All Rights Reserved.</p>
            <p>
              VAT Number - GB 219955471 | Company Number - 9681013 | FCA Number - 715892
            </p>
            <p>
              Disclosure: Whilst every care has been taken to ensure all of the information on this
              site is accurate, please always check with your dealer as errors can occur.
            </p>
            <p>
              We act as a credit broker not a lender. We work with a number of carefully selected
              credit providers who typically will be able to offer you finance for your purchase.
              (Written quotations available on request). Whichever lender we introduce you to, we
              will typically receive a fee from them (either a fixed fee or a percentage of the
              amount you borrow). The lenders we work with could pay commissions at different
              rates. All finance is subject to status and income. Terms and conditions apply.
              Applicants must be 18 years or over.
            </p>
            <p>Autoprestige is the trading name of Cars Unlimited Ltd</p>
          </section>
        </div>
      </div>
    </div>
  )
}
