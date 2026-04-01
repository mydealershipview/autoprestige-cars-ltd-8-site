import { Metadata } from 'next'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Wishlist | ${dealership.name}`,
    description: `View your saved vehicles and find your perfect car at ${dealership.name}.`,
  }
}

export default function Wishlist() {
  return <></>
}
