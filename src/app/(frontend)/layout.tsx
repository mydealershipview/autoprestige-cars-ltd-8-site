import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Montserrat } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/payload/AdminBar'
import CookieConsentModal from '@/components/ui/cookie-consent-modal'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { generateStructuredData } from '@/utilities/structuredData'

import '@/styles/payloadStyles.css';
import '@/styles/globals.css';
import { getServerSideURL } from '@/utilities/getURL'
import Layout from '@/components/Layout'

// Configure Montserrat font
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const structuredData = generateStructuredData()

  return (
    <html className={cn(montserrat.variable, GeistMono.variable)} lang="en-GB" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="64x64" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <Layout>
            {children}
          </Layout>
          <CookieConsentModal />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'MYDV Autos - Trusted Used Car Dealers Nottingham | Quality Pre-Owned Vehicles',
    template: '%s | MYDV Autos - Nottingham Used Car Dealers'
  },
  description: 'MYDV Autos - Your reliable family-run used car dealer in Nottinghamshire. Quality used cars from Audi, BMW, Ford, Mercedes & more. Indoor showroom, FCA registered finance & part exchange welcome.',
  keywords: 'used cars Nottingham, car dealers Nottingham, used car finance Nottingham, part exchange Nottingham, indoor car showroom Nottingham, family car dealers Nottinghamshire, MYDV Autos, FCA registered',
  authors: [{ name: 'MYDV Autos' }],
  creator: 'MYDV Autos',
  publisher: 'MYDV Autos',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: mergeOpenGraph({
    title: 'MYDV Autos - Trusted Used Car Dealers Nottingham',
    description: 'Your honest, reliable, family-run used car dealer in Nottinghamshire. Premium quality vehicles with exceptional aftercare.',
    url: getServerSideURL(),
    siteName: 'MYDV Autos',
    locale: 'en_GB',
    type: 'website',
  }),
  twitter: {
    card: 'summary_large_image',
    title: 'MYDV Autos - Trusted Used Car Dealers Nottingham',
    description: 'Your honest, reliable, family-run used car dealer in Nottinghamshire.',
    creator: '@MYDVautos',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code-here',
  },
}
