import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { ChevronRight } from 'lucide-react'
import { AnimatedCard } from '@/components/AnimatedCard'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MYDV Autos - Trusted Used Car Dealers Nottingham | Quality Pre-Owned Vehicles',
  description: 'MYDV Autos - Your reliable family-run used car dealer in Nottinghamshire. Quality used cars from Audi, BMW, Ford, Mercedes & more. Indoor showroom, FCA registered finance & part exchange welcome.',
  keywords: 'used cars Nottingham, car dealers Nottingham, used car finance Nottingham, part exchange Nottingham, indoor car showroom Nottingham, family car dealers Nottinghamshire, quality used cars, FCA registered, Audi, BMW, Ford, Mercedes, Vauxhall',
  openGraph: {
    title: 'MYDV Autos - Trusted Used Car Dealers Nottingham',
    description: 'Your honest, reliable, family-run used car dealer in Nottinghamshire. Premium quality vehicles with exceptional aftercare.',
    type: 'website',
    locale: 'en_GB',
  },
}

const script = {
  __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": "MYDV Autos",
    "description": "Family-run used car dealer in Nottinghamshire offering quality pre-owned vehicles with exceptional customer service",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Nottingham",
      "addressRegion": "Nottinghamshire",
      "addressCountry": "GB"
    },
    "areaServed": ["Nottingham", "Nottinghamshire", "Derby", "Leicester", "Mansfield", "Birmingham"],
    "makesOffered": ["Audi", "BMW", "Citroen", "Ford", "Hyundai", "Land Rover", "Mercedes", "Skoda", "Vauxhall", "Volvo"],
    "serviceType": ["Used Car Sales", "Car Finance", "Part Exchange", "Vehicle Delivery"],
    "specialties": ["Indoor Showroom", "FCA Registered Finance", "Quality Assurance", "Family-Run Business"],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Used Cars",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Car",
            "name": "Quality Used Cars"
          }
        }
      ]
    }
  })
}

const Home = async () => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const fetchAvailableMakesAndModels = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/available-makes-models`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      console.error('Failed to fetch available makes and models:', err)
      return { makes: [], models: [] }
    }
  }

  const queryHomePage = async () => {
    try {
      const result = await payload.find({
        collection: 'pages',
        draft,
        limit: 1,
        pagination: false,
        overrideAccess: draft,
        where: {
          template: {
            equals: 'homepage',
          },
          slug: {
            equals: 'homepage'
          }
        },
      })
      return result.docs[0]
      // const result = await fetch('http://localhost:3000/api/pages?depth=2&draft=false&locale=undefined')
      // const data = await result.json()
      // const filteredDocs = data.docs.filter(doc => {
      //   return doc.template === "homepage" && doc.slug === "homepage"
      //   // console.log(doc.content)
      // })
      // console.log("🚀 ~ queryHomePage ~ filteredDocs:", filteredDocs[0].content)

    } catch (error) {
      console.error('Error fetching homepage:', error)
      return null
    }
  }

  let promotionsPage = null
  try {
    promotionsPage = await payload.find({
      collection: 'pages',
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: draft,
      where: {
        template: {
          equals: 'promotions',
        },
      },
    })
  } catch (error) {
    console.error('Error fetching promotions page:', error)
  }

  const data = await fetchAvailableMakesAndModels()
  const homePage = await queryHomePage()
  const homeContent = homePage?.content
  const promotions = promotionsPage?.docs?.[0]?.promotionsContent

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-black text-white">
      <style dangerouslySetInnerHTML={{__html: `
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        * {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}} />
      {/* Structured Data for Local Business */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={script}
      />
      
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden shrink-0">
        {/* Video background */}
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/hero_video.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 z-0 bg-black/40" />

        {/* Main Content Area - Bottom Banner */}
        <div className="absolute bottom-0 left-0 w-full z-20 flex items-center justify-between pb-8 pt-16 px-6 lg:px-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
          <div className="flex items-start pointer-events-auto">
            {/* Logo mark */}
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-600 mr-4 -skew-x-[24deg] mt-1"></div>
            
            <div className="flex flex-col">
              <h1 className="text-3xl lg:text-4xl font-black tracking-widest uppercase mb-1 drop-shadow-lg">
                TEMPLATE
              </h1>
              <p className="text-sm lg:text-base text-gray-200 tracking-widest font-medium uppercase drop-shadow-md">
                &quot;Living the dream, driving the dream&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Online Showroom Section */}
      <section className="relative h-screen w-full overflow-clip flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            src="/car_2.jpg" 
            alt="Online Showroom" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Box */}
        <AnimatedCard>
          <div className="flex items-center mb-3">
            <div className="w-6 h-5 bg-red-600 mr-3 -skew-x-[24deg]"></div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-widest uppercase leading-tight">
              ONLINE <br/> SHOWROOM
            </h2>
          </div>
          <p className="text-base text-gray-300 font-medium mb-6">
            Browse our selection of hand-picked prestige and performance cars
          </p>
          <Link href="/used-cars" className="inline-flex items-center text-sm font-bold tracking-widest hover:text-red-500 transition-colors uppercase gap-2">
            BROWSE SHOWROOM <ChevronRight className="h-4 w-4 text-red-500" />
          </Link>
        </AnimatedCard>
      </section>

      {/* Car Finance Section */}
      <section className="relative h-screen w-full overflow-clip flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            src="/car.png" 
            alt="Car Finance" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Box */}
        <AnimatedCard>
          <div className="flex items-center mb-3">
            <div className="w-6 h-5 bg-red-600 mr-3 -skew-x-[24deg]"></div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-widest uppercase leading-tight">
              CAR FINANCE
            </h2>
          </div>
          <p className="text-base text-gray-300 font-medium mb-6">
            Finance your next dream car with our packages
          </p>
          <Link href="/finance" className="inline-flex items-center text-sm font-bold tracking-widest hover:text-red-500 transition-colors uppercase gap-2">
            APPLY TODAY! <ChevronRight className="h-4 w-4 text-red-500" />
          </Link>
        </AnimatedCard>
      </section>

      {/* RAC Warranty Section */}
      <section className="relative h-screen w-full overflow-clip flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            src="/car_3.jpg" 
            alt="RAC Warranty" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Box */}
        <AnimatedCard>
          <div className="flex items-center mb-3">
            <div className="w-6 h-5 bg-red-600 mr-3 -skew-x-[24deg]"></div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-widest uppercase leading-tight">
              RAC WARRANTY
            </h2>
          </div>
          <p className="text-base text-gray-300 font-medium mb-6">
            Protect your car with the UK&apos;s leading warranty provider
          </p>
          <Link href="/warranty" className="inline-flex items-center text-sm font-bold tracking-widest hover:text-red-500 transition-colors uppercase gap-2">
            VIEW PACKAGES <ChevronRight className="h-4 w-4 text-red-500" />
          </Link>
        </AnimatedCard>
      </section>

      {/* Sell Your Car Section */}
      <section className="relative h-screen w-full overflow-clip flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            src="/car_4.jpg" 
            alt="Sell Your Car" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Box */}
        <AnimatedCard>
          <div className="flex items-center mb-3">
            <div className="w-6 h-5 bg-red-600 mr-3 -skew-x-[24deg]"></div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-widest uppercase leading-tight">
              SELL YOUR CAR
            </h2>
          </div>
          <p className="text-base text-gray-300 font-medium mb-6">
            Sell your sport or prestige car directly to TEMPLATE
          </p>
          <Link href="/sell" className="inline-flex items-center text-sm font-bold tracking-widest hover:text-red-500 transition-colors uppercase gap-2">
            GET A QUOTE <ChevronRight className="h-4 w-4 text-red-500" />
          </Link>
        </AnimatedCard>
      </section>

      {/* Welcome Section */}
      <section className="relative h-screen w-full overflow-clip flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            src="/car_5.jpg" 
            alt="Welcome to TEMPLATE" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Box */}
        <AnimatedCard>
          <div className="flex items-center mb-3">
            <div className="w-6 h-5 bg-red-600 mr-3 -skew-x-[24deg]"></div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-widest uppercase leading-tight">
              WELCOME TO TEMPLATE
            </h2>
          </div>
          <p className="text-base text-gray-300 font-medium mb-6 leading-relaxed">
            TEMPLATE specialise in supplying super cars, prestige cars and sports cars with the looks and performance specifically designed to take your breath away
          </p>
          <Link href="/about" className="inline-flex items-center text-sm font-bold tracking-widest hover:text-red-500 transition-colors uppercase gap-2">
            READ MORE <ChevronRight className="h-4 w-4 text-red-500" />
          </Link>
        </AnimatedCard>
      </section>
    </main>
  )
}

export default Home
