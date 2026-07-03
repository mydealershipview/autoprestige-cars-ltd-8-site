import React from 'react'
import type { Metadata } from 'next'

import { MotorTimeHome } from '@/components/home/MotorTimeHome'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://template-8.mydealershipview.com'
  const title = `${dealership.name} | Quality Used Cars`
  const description =
    dealership.seoText ||
    `${dealership.name} - hand-picked quality used cars, finance support, part exchange, warranty options, and a straightforward buying experience.`

  return {
    title,
    description,
    alternates: {
      canonical: serverUrl,
    },
    keywords: [
      'used cars',
      'quality used cars',
      'car finance',
      'part exchange',
      'warranty',
      'car dealership',
      dealership.name,
      dealership.address.city,
    ]
      .filter(Boolean)
      .join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_GB',
      url: serverUrl,
      images: [
        {
          url: `${serverUrl}/website-template-OG.webp`,
          width: 1200,
          height: 630,
          alt: `${dealership.name} used car dealership`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${serverUrl}/website-template-OG.webp`],
    },
  }
}

const Home = async () => {
  const dealership = await getDealershipInfo()

  return <MotorTimeHome dealership={dealership} />
}

export default Home
