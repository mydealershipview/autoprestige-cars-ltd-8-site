import React from 'react'
import type { Metadata } from 'next'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export const dynamic = 'force-static'
export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Privacy Policy | ${dealership.name}`,
    description: 'Learn how we protect your personal data and privacy. Our commitment to GDPR compliance and transparent data handling.',
    openGraph: {
      title: `Privacy Policy | ${dealership.name}`,
      description: 'Our commitment to protecting your privacy and personal data.',
      type: 'website',
      locale: 'en_GB',
    },
  }
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto max-w-4xl px-6 pt-32 pb-16">
        <h1 className="text-3xl font-black tracking-widest uppercase mb-2">
          Privacy Policy
        </h1>
        <div className="w-12 h-1 bg-red-600 mb-8" />

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/80">
          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">1. Who We Are</h2>
            <p>
              We are a used car dealership. This privacy policy explains how we collect, use, and protect your personal
              information when you use our website or interact with us. We are committed to protecting your privacy and
              complying with the UK General Data Protection Regulation (UK GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">2. Information We Collect</h2>
            <p>We may collect the following types of personal information:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Name, email address, and phone number when you contact us or submit an enquiry</li>
              <li>Vehicle preferences and financial information when applying for finance</li>
              <li>IP address and browsing data via cookies (see our Cookie Policy)</li>
              <li>Identity verification documents when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">3. How We Use Your Information</h2>
            <p>We use your personal information to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Respond to your enquiries and process vehicle purchases</li>
              <li>Process finance and part-exchange applications</li>
              <li>Send you relevant updates about vehicles or services you have expressed interest in</li>
              <li>Comply with our legal obligations including anti-money laundering checks</li>
              <li>Improve our website and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">4. Legal Basis for Processing</h2>
            <p>
              We process your personal data on the following legal bases: your consent, the performance of a contract,
              compliance with a legal obligation, and our legitimate interests in running our business and improving our
              services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">5. Data Sharing</h2>
            <p>
              We do not sell your personal data. We may share your data with finance partners, warranty providers, and
              regulatory bodies where required. All third parties are bound by data processing agreements and are required
              to protect your data in accordance with UK GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">6. Data Retention</h2>
            <p>
              We retain personal data only as long as necessary for the purposes it was collected, or as required by law.
              Financial and transaction records are typically retained for 6 years in accordance with HMRC requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">7. Your Rights</h2>
            <p>Under UK GDPR you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Rectify inaccurate data</li>
              <li>Request erasure of your data (right to be forgotten)</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact us via our{' '}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">8. Complaints</h2>
            <p>
              If you have concerns about how we handle your data, you have the right to lodge a complaint with the
              Information Commissioner’s Office (ICO) at{' '}
              <span className="text-white">ico.org.uk</span>.
            </p>
          </section>
        </div>

        <p className="mt-12 text-xs text-white/40">Last updated: March 2026</p>
      </div>
    </div>
  )
}
