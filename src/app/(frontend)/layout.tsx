import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { Montserrat } from 'next/font/google'
import React from 'react'

import CookieConsentModal from '@/components/ui/cookie-consent-modal'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { generateStructuredData } from '@/utilities/structuredData'
import { getDealershipInfo } from '@/lib/services/dealership.service'
import Script from 'next/script'
import Analytics from '@/components/Analytics'

import '@/styles/globals.css'
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
  const dealership = await getDealershipInfo()
  const structuredData = generateStructuredData(dealership)
  const configuredGtmId = process.env.NEXT_PUBLIC_GTM_ID || ''
  const gtmId = /^GTM-[A-Z0-9]+$/.test(configuredGtmId) ? configuredGtmId : ''
  const configuredGa4Id = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || process.env.GOOGLE_ANALYTICS_ID || 'G-J5CW3RRHHV'
  const ga4Id = /^G-[A-Z0-9]+$/.test(configuredGa4Id) ? configuredGa4Id : ''
  const directGa4 = !gtmId && Boolean(ga4Id)

  return (
    <html className={cn(montserrat.variable, GeistMono.variable)} lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer=window.dataLayer||[];
          window.gtag=function(){window.dataLayer.push(arguments)};
          window.__mydvDirectGa4=${directGa4 ? 'true' : 'false'};
          window.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
          try{var choice=localStorage.getItem('mydv-cookie-consent')||localStorage.getItem('cookies-accepted');
          if(choice==='all'||choice==='true')window.gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});
          else if(choice==='analytics')window.gtag('consent','update',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
          }catch(e){}
          ${directGa4 ? `window.gtag('js',new Date());window.gtag('config','${ga4Id}',{send_page_view:true});` : ''}
        ` }} />
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="64x64" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/logo.png" rel="apple-touch-icon" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      </head>
      <body>
        {gtmId && <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" /></noscript>}
        <Providers>
          <Layout>
            {children}
          </Layout>
          <CookieConsentModal />
          <Analytics directGa4={directGa4} />
        </Providers>
        {gtmId ? <Script id="mydv-gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');` }} /> : ga4Id && <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`} strategy="afterInteractive" />}
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()
  const serverUrl = getServerSideURL()
  const title = `${dealership.name} | Quality Used Cars`
  const description =
    dealership.seoText ||
    `Browse quality used prestige vehicles at ${dealership.name} in ${dealership.address.city || 'Bradford'}. Car finance, part exchange, and warranty available. Visit our showroom or apply online today.`

  return {
    metadataBase: new URL(serverUrl),
    title: {
      default: title,
      template: `%s | ${dealership.name}`,
    },
    description,
    keywords: [
      'used cars',
      'car finance',
      'part exchange',
      'prestige vehicles',
      'car dealership',
      'used car dealers',
      dealership.name,
      dealership.address.city,
      dealership.address.postcode,
    ]
      .filter(Boolean)
      .join(', '),
    authors: [{ name: dealership.name }],
    creator: dealership.name,
    publisher: dealership.name,
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    alternates: {
      canonical: serverUrl,
    },
    openGraph: mergeOpenGraph({
      title,
      description,
      url: serverUrl,
      siteName: dealership.name,
      locale: 'en_GB',
      type: 'website',
    }),
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
  }
}
