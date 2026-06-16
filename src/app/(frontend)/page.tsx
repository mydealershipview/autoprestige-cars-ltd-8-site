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
            alt="Car Finance — Apply for HP, PCP and competitive finance packages at Autoprestige Cars" 
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
          <h3 className="text-sm text-gray-400 font-semibold tracking-widest uppercase mb-2">RAC &amp; In-House Protection</h3>
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
          <Link href="/profile" className="inline-flex items-center text-sm font-bold tracking-widest hover:text-blue-400 !transition-colors uppercase gap-2">
            READ MORE <ChevronRight className="h-4 w-4 text-blue-400" />
          </Link>
        </AnimatedCard>
      </section>

      {/* FAQ & Trust Section — GEO-optimised for AI citation */}
      <section className="relative py-20 px-6 lg:px-12 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-black tracking-widest uppercase mb-8 text-center">
            Quality Prestige Vehicles in {dealership.address.city || 'Bradford'}
          </h2>

          <div className="text-gray-300 text-sm lg:text-base leading-relaxed space-y-6">
            <p>
              Welcome to {displayName}, your trusted independent car dealership based in {dealership.address.city || 'Bradford'}, West Yorkshire. We specialise in sourcing and supplying the finest prestige and performance vehicles, offering a carefully curated selection of hand-picked cars from leading manufacturers including BMW, Mercedes-Benz, Audi, Land Rover, and Porsche. With over a decade of experience in the prestige car market, we have built a reputation for quality, transparency, and exceptional customer service.
            </p>

            <h3 className="text-lg font-bold text-white tracking-widest uppercase mt-8">What vehicles do you sell?</h3>
            <p>
              {displayName} stocks a rotating inventory of 30–50 prestige and performance vehicles at any time. Our range typically includes luxury saloons, high-performance coupes, premium SUVs, and executive estates. Every vehicle undergoes a rigorous multi-point inspection by our qualified technicians before being offered for sale. We believe in complete transparency — each car comes with a full history check, and we encourage all customers to view, test drive, and inspect any vehicle before purchase.
            </p>

            <h3 className="text-lg font-bold text-white tracking-widest uppercase mt-8">Do you offer car finance?</h3>
            <p>
              Yes — we offer flexible finance options including Hire Purchase (HP) and Personal Contract Purchase (PCP) to suit your budget. As an FCA-authorised credit broker (FCA No. {dealership.fcaNumber || '715892'}), we work with a panel of carefully selected lenders to find the most competitive rates. We can typically provide a finance decision within 24 hours of application. Apply online in minutes, or speak to our finance team on <span className="text-white font-semibold">{dealership.phone || '01274 488500'}</span>. All finance is subject to status — UK residents aged 18+ only.
            </p>

            <h3 className="text-lg font-bold text-white tracking-widest uppercase mt-8">Can I part exchange my car?</h3>
            <p>
              Absolutely. We offer competitive part exchange valuations on your current vehicle, whether you are trading up to one of our prestige cars or looking to sell outright. Our team will provide a fair, no-obligation valuation based on current market conditions, typically within the same day. We accept all makes and models — not just prestige brands — and can settle any outstanding finance on your behalf.
            </p>

            <h3 className="text-lg font-bold text-white tracking-widest uppercase mt-8">Do your cars come with a warranty?</h3>
            <p>
              Yes. All vehicles from {displayName} come with warranty protection. We partner with leading providers including the RAC to offer extended warranty coverage. Plans range from basic powertrain protection to fully comprehensive packages that cover major mechanical and electrical components. Every warranty includes roadside assistance and recovery, giving you complete peace of mind wherever you drive.
            </p>

            <h3 className="text-lg font-bold text-white tracking-widest uppercase mt-8">Where are you based?</h3>
            <p>
              Our showroom is located in {dealership.address.city || 'Bradford'}, West Yorkshire. We are open Monday to Friday 9am–6pm, Saturday 9am–5pm, and Sunday by appointment. We serve customers across Bradford, Leeds, Huddersfield, Wakefield, Halifax, and throughout West Yorkshire. Call us on <span className="text-white font-semibold">{dealership.phone || '01274 488500'}</span> to arrange a viewing or test drive, or visit our contact page for directions.
            </p>
          </div>
        </div>
      </section>

      {/* Recently Sold Slider */}
      <SoldCarsSlider />
    </main>
  )
}

export default Home

Home

