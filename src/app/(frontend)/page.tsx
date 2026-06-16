import React from 'react'
import type { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'
import { AnimatedCard } from '@/components/AnimatedCard'
import { SoldCarsSlider } from '@/components/home/SoldCarsSlider'
import Link from 'next/link'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://template-8.mydealershipview.com'
  const title = `${dealership.name} | Prestige Vehicle Dealership`
  const description =
    dealership.seoText?.length > 100
      ? dealership.seoText
      : `Browse quality used prestige vehicles at ${dealership.name} in ${dealership.address.city || 'Bradford'}. Car finance, part exchange, and warranty available. Visit our showroom or apply online today.`

  return {
    title,
    description,
    alternates: {
      canonical: serverUrl,
    },
    keywords: [
      'used cars',
      'car dealers',
      'used car finance',
      'part exchange',
      'prestige vehicles',
      'car dealership',
      'prestige car dealer',
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
          alt: `${dealership.name} — Prestige Vehicles in ${dealership.address.city || 'Bradford'}`,
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
  const displayName = dealership.name || 'Dealership'
  const displayTagline = dealership.tagline || 'Trusted used vehicles and support'

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

      
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden shrink-0">
        {/* Video background */}
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
           autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero-poster.png"
        >
          {/* <source src="/hero_mobile.webm" type="video/webm" media="(max-width: 768px)" />
          <source src="/hero_video.mp4" type="video/mp4" /> */}

          {/* <source src="/hero_mobile.webm" type="video/webm" media="(max-width: 768px)" /> */}
          {/* Mobile MP4 fallback */}
          {/* <source src="/hero_mobile.mp4" type="video/mp4" media="(max-width: 768px)" /> */}
          <source src="https://pub-d7a6ee47169b484abb7da416732624a8.r2.dev/autoprestige/output_mobile.mp4" type="video/mp4" media="(max-width: 768px)" />

          {/* Desktop */}
          {/* <source src="/hero_desktop.mp4" type="video/mp4" /> */}
          <source src="https://pub-d7a6ee47169b484abb7da416732624a8.r2.dev/autoprestige/hero_video.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 z-0 bg-black/40" />

        {/* Main Content Area - Bottom Banner */}
        <div className="absolute bottom-0 left-0 w-full z-20 flex items-center justify-between pb-8 pt-16 px-6 lg:px-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="flex items-start">
            {/* Logo mark */}
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 mr-4 -skew-x-[24deg] mt-1"></div>
            
            <div className="flex flex-col">
              <h1 className="text-3xl lg:text-4xl font-black tracking-widest uppercase mb-1 drop-shadow-lg">
                {displayName} — Prestige Vehicle Dealership
              </h1>
              <p className="text-sm lg:text-base text-gray-200 tracking-widest font-medium uppercase drop-shadow-md">
                {displayTagline}
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
            alt="Online Showroom — Browse prestige and performance cars at Autoprestige Cars" 
            className="w-full h-full object-cover"
            width="1920"
            height="1080"
            fetchPriority="high"
          />
        </div>
        
        {/* Content Box */}
        <AnimatedCard>
          <div className="flex items-center mb-3">
            <div className="w-6 h-5 bg-blue-500 mr-3 -skew-x-[24deg]"></div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-widest uppercase leading-tight">
              ONLINE <br/> SHOWROOM
            </h2>
          </div>
          <h3 className="text-sm text-gray-400 font-semibold tracking-widest uppercase mb-2">Prestige &amp; Performance Vehicles</h3>
          <p className="text-base text-gray-300 font-medium mb-6">
            Browse our selection of hand-picked prestige and performance cars
          </p>
          <Link href="/usedcars" className="inline-flex items-center text-sm font-bold tracking-widest hover:text-blue-400 !transition-colors uppercase gap-2">
            BROWSE SHOWROOM <ChevronRight className="h-4 w-4 text-blue-400" />
          </Link>
        </AnimatedCard>
      </section>

      {/* Car Finance Section */}
      <section className="relative h-screen w-full overflow-clip flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            src="/car.png" 
            alt="Car Finance — Apply for competitive finance packages at Autoprestige Cars" 
            className="w-full h-full object-cover"
            width="1920"
            height="1080"
            loading="lazy"
          />
        </div>
        
        {/* Content Box */}
        <AnimatedCard>
          <div className="flex items-center mb-3">
            <div className="w-6 h-5 bg-blue-500 mr-3 -skew-x-[24deg]"></div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-widest uppercase leading-tight">
              CAR FINANCE
            </h2>
          </div>
          <h3 className="text-sm text-gray-400 font-semibold tracking-widest uppercase mb-2">HP, PCP &amp; Competitive Packages</h3>
          <p className="text-base text-gray-300 font-medium mb-6">
            Finance your next dream car with our packages
          </p>
          <Link href="/finance" className="inline-flex items-center text-sm font-bold tracking-widest hover:text-blue-400 !transition-colors uppercase gap-2">
            APPLY TODAY! <ChevronRight className="h-4 w-4 text-blue-400" />
          </Link>
        </AnimatedCard>
      </section>

      {/* RAC Warranty Section */}
      <section className="relative h-screen w-full overflow-clip flex items-end md:pb-8">
        <div className="absolute inset-0 z-0">
          <img 
            src="/car_3.jpeg" 
            alt="Extended warranty coverage — in-house warranty for prestige vehicles at Autoprestige Cars" 
            className="w-full h-full object-cover"
            width="1920"
            height="1080"
            loading="lazy"
          />
        </div>
        
        {/* Content Box */}
        <AnimatedCard>
          <div className="flex items-center mb-3">
            <div className="w-6 h-5 bg-blue-500 mr-3 -skew-x-[24deg]"></div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-widest uppercase leading-tight">
              WARRANTY
            </h2>
          </div>
          <h3 className="text-sm text-gray-400 font-semibold tracking-widest uppercase mb-2">In-House Protection</h3>
          <p className="text-base text-gray-300 font-medium mb-6">
            Protect your new car with warranty from leading third party providers or our in house warranty
          </p>
          {/* <Link href="/warranty" className="inline-flex items-center text-sm font-bold tracking-widest hover:text-blue-400 !transition-colors uppercase gap-2">
            VIEW PACKAGES <ChevronRight className="h-4 w-4 text-blue-400" />
          </Link> */}
        </AnimatedCard>
      </section>

      {/* Sell Your Car Section */}
      <section className="relative h-screen w-full overflow-clip flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            src="/car_4.jpg" 
            alt="Sell your car — get a competitive valuation for your prestige or performance vehicle at Autoprestige Cars" 
            className="w-full h-full object-cover"
            width="1920"
            height="1080"
            loading="lazy"
          />
        </div>
        
        {/* Content Box */}
        <AnimatedCard>
          <div className="flex items-center mb-3">
            <div className="w-6 h-5 bg-blue-500 mr-3 -skew-x-[24deg]"></div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-widest uppercase leading-tight">
              SELL YOUR CAR
            </h2>
          </div>
          <p className="text-base text-gray-300 font-medium mb-6">
            Sell your sport or prestige car directly to {displayName}
          </p>
          <Link href="/valuation" className="inline-flex items-center text-sm font-bold tracking-widest hover:text-blue-400 !transition-colors uppercase gap-2">
            GET A QUOTE <ChevronRight className="h-4 w-4 text-blue-400" />
          </Link>
        </AnimatedCard>
      </section>

      {/* Welcome Section */}
      <section className="relative h-screen w-full overflow-clip flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            src="/car_5.jpg" 
            alt={`Welcome to ${displayName} — prestige and performance vehicles in Bradford, West Yorkshire`} 
            className="w-full h-full object-cover"
            width="1920"
            height="1080"
            loading="lazy"
          />
        </div>
        
        {/* Content Box */}
        <AnimatedCard>
          <div className="flex items-center mb-3">
            <div className="w-6 h-5 bg-blue-500 mr-3 -skew-x-[24deg]"></div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-widest uppercase leading-tight">
              WELCOME TO {displayName.toUpperCase()}
            </h2>
          </div>
          <h3 className="text-sm text-gray-400 font-semibold tracking-widest uppercase mb-2">Your Trusted Bradford Dealer</h3>
          <p className="text-base text-gray-300 font-medium mb-6 leading-relaxed">
            {displayName} specialises in supplying prestige and performance vehicles with standout design and confidence-inspiring performance.
          </p>
          <Link href="/contents/profile" className="inline-flex items-center text-sm font-bold tracking-widest hover:text-blue-400 !transition-colors uppercase gap-2">
            READ MORE <ChevronRight className="h-4 w-4 text-blue-400" />
          </Link>
        </AnimatedCard>
      </section>

      {/* Recently Sold Slider */}
      <SoldCarsSlider />
    </main>
  )
}

export default Home

Home

