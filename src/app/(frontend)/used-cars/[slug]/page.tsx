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
    return fallbackMetadata
  }

  try {
    const queryParams = new URLSearchParams({
      make: slugData.make
    })

    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/listing/${slugData.stockId}?${queryParams}`)

    if (!response.ok) {
      return fallbackMetadata
    }

    const data: VehicleResponse = await response.json()
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
      `${make} ${model} Nottingham`,
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

    try {
      const queryParams = new URLSearchParams({
        make: slugData.make
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/listing/${slugData.stockId}?${queryParams}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: VehicleResponse = await response.json()
      return {
        ...data,
        // updatedDescription: payloadResponse?.description || data.vehicle?.adverts?.retailAdverts?.description
      }
    } catch (_err) {
      return null
    }
  }

  const vehicleDetails = await fetchVehicleDetails()

  if (!vehicleDetails) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-7 bg-red-600 -skew-x-[24deg]" />
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-widest uppercase text-white mb-4">Vehicle Not Found</h1>
          <p className="text-white/60 text-sm mb-8">{'The vehicle you\'re looking for could not be found.'}</p>
          <Link
            href="/used-cars"
            className="inline-flex items-center justify-center px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold tracking-widest uppercase !transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Link>
        </div>
      </div>
    )
  }

  const { vehicle } = vehicleDetails

  const contactPhone =
    contactData?.phoneNumbers?.find((entry) => entry.isPrimary)?.number ||
    contactData?.phoneNumbers?.[0]?.number ||
    ''
  const contactEmail =
    contactData?.emailAddresses?.find((entry) => entry.isPrimary)?.email ||
    contactData?.emailAddresses?.[0]?.email ||
    ''

  return (
    <VehicleClient
      vehicle={vehicle}
      dealershipName={dealership.name}
      phoneNumber={contactPhone}
      emailAddress={contactEmail}
    />
  )
}
