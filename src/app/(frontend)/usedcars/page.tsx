
import type { Metadata } from 'next'
import UsedCarsComponent from './_components'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Used Cars | ${dealership.name}`,
    description:
      `Browse quality used cars from ${dealership.name}. Finance options and part exchange available.`,
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
