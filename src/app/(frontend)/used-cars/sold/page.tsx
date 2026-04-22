
import type { Metadata } from 'next'
import UsedCarsComponent from '../_components/sold-cars'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Used Cars | ${dealership.name}`,
    description:
      dealership.seoText ||
      `Browse quality used cars from ${dealership.name}. Finance options and part exchange available.`,
    keywords: [
      'used cars for sale',
      'second hand cars',
      'pre-owned vehicles',
      'car finance',
      dealership.name,
      dealership.address.city,
    ]
      .filter(Boolean)
      .join(', '),
    openGraph: {
      title: `Used Cars | ${dealership.name}`,
      description: `Discover quality used cars from ${dealership.name}.`,
      type: 'website',
      locale: 'en_GB',
    },
  }
}

export default async function UsedCarsPage() {
  return <UsedCarsComponent listingsData={null} />
}
