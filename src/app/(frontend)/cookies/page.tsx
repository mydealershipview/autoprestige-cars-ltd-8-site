import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export const dynamic = 'force-static'
export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Cookie Preferences | ${dealership.name}`,
    description: 'Learn about how we use cookies and manage your cookie preferences.',
    openGraph: {
      title: `Cookie Preferences | ${dealership.name}`,
      description: 'How we use cookies and how to manage your preferences.',
      type: 'website',
      locale: 'en_GB',
    },
  }
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto max-w-4xl px-6 pt-32 pb-16">
        <h1 className="text-3xl font-black tracking-widest uppercase mb-2">
          Cookie Preferences
        </h1>
        <div className="w-12 h-1 bg-red-600 mb-8" />

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/80">
          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your device when you visit a website. They help the website function
              correctly, remember your preferences, and provide us with information about how the site is used.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">Cookies We Use</h2>

            <h3 className="font-semibold text-white mt-4 mb-1">Strictly Necessary Cookies</h3>
            <p>
              These cookies are essential for the website to function. They enable core features such as security,
              network management, and account login. You cannot opt out of these cookies.
            </p>

            <h3 className="font-semibold text-white mt-4 mb-1">Analytics Cookies</h3>
            <p>
              We use analytics cookies (such as Google Analytics) to understand how visitors use our site. This helps us
              improve the user experience. All data collected is anonymised. These cookies are only set with your consent.
            </p>

            <h3 className="font-semibold text-white mt-4 mb-1">Marketing Cookies</h3>
            <p>
              Marketing cookies track your browsing activity to show you relevant advertising on other sites. We only use
              these with your explicit consent.
            </p>

            <h3 className="font-semibold text-white mt-4 mb-1">Preference Cookies</h3>
            <p>
              These cookies remember choices you make (such as your region or language) to provide a more personalised
              experience.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">Managing Your Preferences</h2>
            <p>
              You can manage your cookie preferences at any time using the cookie consent banner on our website or through
              your browser settings. Please note that disabling certain cookies may affect the functionality of the site.
            </p>
            <p className="mt-2">
              Most browsers allow you to refuse or delete cookies. Visit your browser’s help section for instructions:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Chrome: Settings &gt; Privacy and security &gt; Cookies</li>
              <li>Firefox: Options &gt; Privacy &amp; Security</li>
              <li>Safari: Preferences &gt; Privacy</li>
              <li>Edge: Settings &gt; Cookies and site permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">Third-Party Cookies</h2>
            <p>
              Some of our pages include content from third-party services (such as YouTube videos or social media widgets).
              These services may set their own cookies. We do not control these cookies — please refer to the third
              party’s own privacy and cookie policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-wider uppercase text-white mb-2">More Information</h2>
            <p>
              For more information about how we handle your personal data, please see our{' '}
              <Link href="/privacy" className="text-red-500 underline hover:text-red-400">Privacy Policy</Link>.
              If you have questions, please{' '}
              <Link href="/contact" className="text-red-500 underline hover:text-red-400">contact us</Link>.
            </p>
          </section>
        </div>

        <p className="mt-12 text-xs text-white/40">Last updated: March 2026</p>
      </div>
    </div>
  )
}
