import {
  ArrowLeft,
  Car,
} from 'lucide-react'
import { AutoTraderVehicle, fetchAllAutoTraderListings } from '@/utilities/autotrader'
import { generateVehicleSlug } from '@/utilities/formatVehicleData'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ContactData } from '@/types/contact'
import type { Metadata } from 'next'
import VehicleClient from './_components/VehicleClient'


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
    title: 'Quality Used Car for Sale | MYDV Autos Nottingham',
    description: 'Discover this premium quality used car at MYDV Autos in Nottingham. Expert valuations, finance options, and exceptional customer service. Visit our showroom today.',
    keywords: 'used cars for sale, quality used cars, car dealer Nottingham, car finance, MYDV Autos',
    openGraph: {
      title: 'Quality Used Car for Sale | MYDV Autos',
      description: 'Premium quality used car available at MYDV Autos Nottingham. Finance options and part exchange welcome.',
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

    const title = `${year ? `${year} ` : ''}${make} ${model}${priceText} | Used Cars Nottingham | MYDV Autos`
    const description = `${year ? `${year} ` : ''}${make} ${model}${mileageText}. ${fuelType ? `${fuelType} engine` : ''}${transmission ? `, ${transmission} transmission` : ''}${bodyType ? `, ${bodyType} body style` : ''}. Quality used car with finance options available at MYDV Autos Nottingham.`

    const keywords = [
      `${make} ${model} for sale`,
      `used ${make} ${model}`,
      `${make} ${model} Nottingham`,
      year ? `${year} ${make} ${model}` : '',
      fuelType ? `${fuelType} ${make}` : '',
      transmission ? `${transmission} ${make}` : '',
      'used cars Nottingham',
      'car finance Nottingham',
      'MYDV Autos'
    ].filter(Boolean).join(', ')

    return {
      title: title.length > 60 ? `Buy Used ${year ? `${year} ` : ''}${make} ${model} | MYDV Autos Nottingham` : title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      keywords,
      openGraph: {
        title: `${year ? `${year} ` : ''}${make} ${model}${priceText}`,
        description: `Premium quality ${make} ${model}${mileageText} available at MYDV Autos Nottingham. Finance options and part exchange welcome.`,
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
  const payload = await getPayload({ config: configPromise })

  const parseSlug = (slug: string) => {
    const parts = slug.split('-')
    if (parts.length < 4) return null

    const stockId = parts[parts.length - 1]
    const year = parts[parts.length - 2]
    const model = parts.slice(1, -2).join('-')
    const make = parts[0]

    return { make, model, year, stockId }
  }

  const fetchContactInfo = async (): Promise<ContactData | null> => {
    try {
      const result = await payload.findGlobal({
        slug: 'contactInfo',
      })

      return result || null
    } catch (error) {
      console.error('Error fetching contact info:', error)
      return null
    }
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
    } catch (err) {
      return null
    }
  }

  const contactData = await fetchContactInfo()
  const vehicleDetails = await fetchVehicleDetails()

  if (!vehicleDetails) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
            <Car className="h-8 w-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Vehicle Not Found</h1>
          <p className="text-slate-600 mb-8">{'The vehicle you\'re looking for could not be found.'}</p>
          <Link
            href="/used-cars"
            className="bg-[#44903C] hover:bg-[#44903C]/90 text-white cursor-pointer rounded-lg px-2 py-1 md:px-4 md:py-2 flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Link>
        </div>
      </div>
    )
  }

  const { vehicle, similarProducts, totalSimilar } = vehicleDetails

  return (
    <VehicleClient vehicle={vehicle} />
  )
}
