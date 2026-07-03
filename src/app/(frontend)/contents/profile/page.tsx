import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Profile | Motor Time Group',
  description:
    'See Motor Time Group profile - family-run car dealership based in Long Eaton, Nottingham with hand-picked quality used cars.',
  openGraph: {
    title: 'Profile | Motor Time Group',
    description:
      'Family-run car dealership based in Long Eaton, Nottingham. Hand-picked quality used cars, prepared to retail-ready standard.',
    type: 'website',
    locale: 'en_GB',
  },
}

const openingTimes = [
  'Open 7 days: 10:00 - 17:00',
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-6xl px-6 pt-32 pb-16">
        <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-2">
          SEE MOTOR TIME GROUP PROFILE - QUALITY USED CAR DEALER
        </h1>
        <div className="w-16 h-1 bg-blue-500 mb-10" />

        <div className="space-y-10 text-white/80">
          <section className="space-y-3">
            <h2 className="text-xl font-black tracking-wide uppercase text-white">Motor Time Group</h2>
            <p className="leading-relaxed">
              Motor Time Group is a family-run independent car dealership based in Long Eaton, Nottingham,
              specialising in selecting only the highest quality vehicles. Our reputation has
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
              Motor Time Group we pride ourselves on selling the very best quality vehicles. We have
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
                href="tel:07441940552"
                className="text-lg font-semibold text-white hover:text-blue-400 !transition-colors"
              >
                07441 940552
              </a>
              <div className="mt-4">
                <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline text-sm">
                  Contact Us &gt;
                </Link>
              </div>
            </article>

            <article className="border border-white/10 p-6 bg-white/[0.02]">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">Our Location</h3>
              <p className="leading-relaxed">
                8A-8E Huss's Lane
                <br />
                Long Eaton
                <br />
                Nottingham
                <br />
                NG10 1GS
              </p>
              <div className="mt-4">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=8A-8E+Huss+Lane+Long+Eaton+Nottingham+NG10+1GS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline text-sm"
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
        </div>
      </div>
    </div>
  )
}
