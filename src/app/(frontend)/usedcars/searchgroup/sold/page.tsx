
import type { Metadata } from 'next'
import UsedCarsComponent from '../../_components/sold-cars'
import { getDealershipInfo } from '@/lib/services/dealership.service'
import NotFound from '../../../not-found'

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Recently Sold Cars | ${dealership.name}`,
    description: `Prestige and performance cars recently sold by ${dealership.name}. See what we sell, then browse our current stock.`,
    openGraph: {
      title: `Recently Sold Cars | ${dealership.name}`,
      description: `Prestige and performance cars recently sold by ${dealership.name}.`,
      type: 'website',
      locale: 'en_GB',
    },
  }
}

export default async function UsedCarsPage() {
  // return <NotFound />
  return <UsedCarsComponent listingsData={null} />
}
