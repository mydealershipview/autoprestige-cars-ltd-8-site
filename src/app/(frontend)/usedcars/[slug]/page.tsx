import { notFound } from 'next/navigation'
import { getVehicleDetails } from '@/lib/services/vehicleDetails'
import { cache } from 'react'
const readVehicleDetails = cache(getVehicleDetails)
import {
  ArrowLeft,
  Car,
} from 'lucide-react'
import { AutoTraderVehicle } from '@/utilities/autotrader'
import Link from 'next/link'
import type { Metadata } from 'next'
import VehicleClient from './_components/VehicleClient'
import { getDealershipInfo } from '@/lib/services/dealership.service'
import { mapDealershipInfoToContactData } from '@/utilities/dealershipInfo'


interface VehicleResponse {
  vehicle: AutoTraderVehicle
  similarProducts: AutoTraderVehicle[]
  totalSimilar: number
}

// export const revalidate = 60 // Revalidate every hour

// export const generateStaticParams = async () => {
//   try {
//     console.log('Generating static params for vehicle pages...')
//     const allVehicles = await fetchAllAutoTraderListings()

//     const slugs = allVehicles.map((vehicle) => ({
//       slug: generateVehicleSlug(vehicle)
//     }))

//     console.log(`Generated ${slugs.length} static params for vehicle pages`)
//     return slugs
//   } catch (error) {
//     console.error('Error generating static params:', error)
//     // Return empty array to prevent build failure
//     return []
//   }
// }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const dealership = await getDealershipInfo()
  const dealershipName = dealership.name
  const dealershipCity = dealership.address.city || 'your area'

  const parseSlug = (slug: string) => {
    const parts = slug.split('-')
    if (parts.length < 4) return null

    const stockId = parts[parts.length - 1]
    const year = parts[parts.length - 2]
    const model = parts.slice(1, -2).join('-')
    const make = parts[0]

    return { make, model, year, stockId }
  }

  const slugData = parseSlug(slug)

  // Fallback metadata
  const fallbackMetadata: Metadata = {
    title: `Quality Used Car For Sale | ${dealershipName}`,
    description: `Discover this quality used car at ${dealershipName}. Expert valuations, finance options, and customer-first support.`,
    keywords: ['used cars for sale', 'quality used cars', `car dealer ${dealershipCity}`, dealershipName]
      .filter(Boolean)
      .join(', '),
    openGraph: {
      title: `Quality Used Car For Sale | ${dealershipName}`,
      description: `Premium quality used car available at ${dealershipName}. Finance options and part exchange welcome.`,
      type: 'website',
      locale: 'en_GB',
    },
  }

  if (!slugData) {
    notFound()
  }

  try {
    const data = await readVehicleDetails(slugData.stockId)
    if (!data) notFound()
    const vehicle = data.vehicle

    if (!vehicle) {
      return fallbackMetadata
    }

    const make = vehicle.vehicle.make || vehicle.vehicle.standard?.make || 'Quality'
    const model = vehicle.vehicle.model || vehicle.vehicle.standard?.model || 'Used Car'
    const year = vehicle.vehicle.yearOfManufacture || ''
    const price = vehicle.adverts.forecourtPrice?.amountGBP || vehicle.adverts.retailAdverts?.suppliedPrice?.amountGBP
    const mileage = vehicle.vehicle.odometerReadingMiles
    const fuelType = vehicle.vehicle.fuelType || vehicle.vehicle.standard?.fuelType
    const transmission = vehicle.vehicle.transmissionType || vehicle.vehicle.standard?.transmissionType
    const bodyType = vehicle.vehicle.bodyType || vehicle.vehicle.standard?.bodyType

    const priceText = price ? ` for £${price.toLocaleString()}` : ''
    const mileageText = mileage ? ` with ${mileage.toLocaleString()} miles` : ''

    const title = `${year ? `${year} ` : ''}${make} ${model}${priceText} | Used Cars ${dealershipCity} | ${dealershipName}`
    const description = `${year ? `${year} ` : ''}${make} ${model}${mileageText}. ${fuelType ? `${fuelType} engine` : ''}${transmission ? `, ${transmission} transmission` : ''}${bodyType ? `, ${bodyType} body style` : ''}. Quality used car with finance options available at ${dealershipName}.`

    const keywords = [
      `${make} ${model} for sale`,
      `used ${make} ${model}`,
      `${make} ${model} ${dealershipCity}`,
      year ? `${year} ${make} ${model}` : '',
      fuelType ? `${fuelType} ${make}` : '',
      transmission ? `${transmission} ${make}` : '',
      `used cars ${dealershipCity}`,
      `car finance ${dealershipCity}`,
      dealershipName,
    ].filter(Boolean).join(', ')

    return {
      title:
        title.length > 60
          ? `Buy Used ${year ? `${year} ` : ''}${make} ${model} | ${dealershipName}`
          : title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      keywords,
      openGraph: {
        title: `${year ? `${year} ` : ''}${make} ${model}${priceText}`,
        description: `Premium quality ${make} ${model}${mileageText} available at ${dealershipName}. Finance options and part exchange welcome.`,
        type: 'website',
        locale: 'en_GB',
        images: vehicle.media?.images?.length > 0 ? [
          {
            url: vehicle.media.images[0].href,
            alt: `${year ? `${year} ` : ''}${make} ${model}`,
          }
        ] : undefined,
      },
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error
    console.error('Error generating metadata for vehicle:', error)
    return fallbackMetadata
  }
}

export default async function IndividualListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const dealership = await getDealershipInfo()
  const contactData = mapDealershipInfoToContactData(dealership)

  const parseSlug = (slug: string) => {
    const parts = slug.split('-')
    if (parts.length < 4) return null

    const stockId = parts[parts.length - 1]
    const year = parts[parts.length - 2]
    const model = parts.slice(1, -2).join('-')
    const make = parts[0]

    return { make, model, year, stockId }
  }

  const fetchVehicleDetails = async () => {
    const slugData = parseSlug(slug)
    if (!slugData) {
      return null
    }

    return readVehicleDetails(slugData.stockId)
  }

  const vehicleDetails = await fetchVehicleDetails()

  if (!vehicleDetails) {
    notFound()
  }

  const { vehicle } = vehicleDetails

  const contactPhone =
    contactData?.phoneNumbers?.find((entry) => entry.isPrimary)?.number ||
    contactData?.phoneNumbers?.[0]?.number ||
    ''

  // WhatsApp must always go to the dealership mobile (07725 124729)
  const whatsappNumber = '447725124729'
  const contactEmail =
    contactData?.emailAddresses?.find((entry) => entry.isPrimary)?.email ||
    contactData?.emailAddresses?.[0]?.email ||
    ''

  return (
    <VehicleClient
      vehicle={vehicle}
      dealershipName={dealership.name}
      phoneNumber={contactPhone}
      whatsappNumber={whatsappNumber}
      emailAddress={contactEmail}
    />
  )
}
