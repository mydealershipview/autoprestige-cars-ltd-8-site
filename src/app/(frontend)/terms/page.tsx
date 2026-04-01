import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export const dynamic = 'force-static'
export const revalidate = 600

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto max-w-4xl px-6 pt-32 pb-16">
        <h1 className="text-3xl font-black tracking-widest uppercase mb-2">
          Terms &amp; Conditions
        </h1>
        <div className="w-12 h-1 bg-red-600 mb-8" />

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/80">
          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">1. Introduction</h2>
            <p>
              These terms and conditions govern your use of our website and the purchase of vehicles and services from us.
              By accessing this website or purchasing from us, you agree to be bound by these terms. Please read them carefully.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">2. Vehicle Sales</h2>
            <p>
              All vehicles are sold subject to availability. Prices are inclusive of VAT where applicable and are correct at time
              of publication. We reserve the right to change prices without prior notice. Vehicle specifications, mileages, and
              service histories are provided in good faith based on the information available to us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">3. Finance Agreements</h2>
            <p>
              Finance is subject to status and affordability checks. We are authorised and regulated by the Financial Conduct
              Authority (FCA). Written quotations are available on request. You have the right to withdraw from a credit
              agreement within 14 days of signing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">4. Warranty</h2>
            <p>
              All vehicles come with a minimum 3-month warranty unless otherwise stated. The warranty covers mechanical and
              electrical failure of listed components. It does not cover wear and tear, consumables, accident damage, or
              modifications made after purchase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">5. Returns &amp; Cancellations</h2>
            <p>
              If you have purchased a vehicle remotely (online or by telephone) you have a 14-day right to cancel under the
              Consumer Contracts Regulations 2013. Vehicles purchased in person at our premises are not subject to a statutory
              right of return unless they are faulty.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">6. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, we exclude all liability for indirect or consequential losses arising from
              your use of this website or the purchase of any vehicle or service. Nothing in these terms limits our liability for
              death, personal injury, or fraud.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">7. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes shall be
              subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">8. Contact</h2>
            <p>
              If you have any questions about these terms, please contact us via the details on our{' '}
              <Link href="/contact" className="text-red-500 underline hover:text-red-400">
                Contact Us
              </Link>{' '}
              page.
            </p>
          </section>
        </div>

        <p className="mt-12 text-xs text-white/40">Last updated: March 2026</p>
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Terms and Conditions | ${dealership.name}`,
    description: 'Read our terms and conditions for purchasing vehicles, finance agreements, and warranty coverage.',
    openGraph: {
      title: `Terms and Conditions | ${dealership.name}`,
      description: 'Terms and conditions governing vehicle purchases, finance, and warranties.',
      type: 'website',
      locale: 'en_GB',
    },
  }
}
