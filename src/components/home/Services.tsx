"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import Link from 'next/link'

const servicesData = [
  {
    id: 'sell',
    title: 'SELL YOUR CAR',
    navTitle: 'SELL YOUR CAR',
    description: 'We could be looking to buy your car. Simply provide your vehicle details and our team will contact you with a valuation.',
    image: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1000&auto=format&fit=crop',
    link: '/sell'
  },
  {
    id: 'inspection',
    title: 'FULL INSPECTION',
    navTitle: 'FULL INSPECTION',
    description: 'Every vehicle undergoes a rigorous comprehensive inspection by our specialized technicians, ensuring the highest standards of quality and performance are met before it reaches you.',
    image: 'https://images.unsplash.com/photo-1632733711679-529326f6db12?q=80&w=1000&auto=format&fit=crop',
    link: '/inspection'
  },
  {
    id: 'part-exchange',
    title: 'PART EXCHANGE',
    navTitle: 'PART EXCHANGE',
    description: 'Upgrade your current vehicle seamlessly. We offer highly competitive part exchange valuations to make your transition into a new prestige vehicle as smooth as possible.',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1000&auto=format&fit=crop',
    link: '/part-exchange'
  }
]

export function Services() {
  const [activeIndex, setActiveIndex] = useState(0)
  
  const activeService = servicesData[activeIndex]

  const nextService = () => {
    setActiveIndex((prev) => (prev + 1) % servicesData.length)
  }

  const prevService = () => {
    setActiveIndex((prev) => (prev === 0 ? servicesData.length - 1 : prev - 1))
  }

  return (
    <section className="bg-[#121212] py-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <h2 className="text-3xl md:text-5xl font-light text-white tracking-widest uppercase">
            Our Services
          </h2>
          
          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 md:gap-8 text-xs md:text-sm tracking-widest uppercase text-zinc-500">
            {servicesData.map((service, index) => (
              <button
                key={service.id}
                onClick={() => setActiveIndex(index)}
                className={`transition-colors duration-300 flex items-center gap-2 ${
                  activeIndex === index ? 'text-white font-medium' : 'hover:text-zinc-300 font-light'
                }`}
              >
                {activeIndex === index && <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />}
                {service.navTitle}
                {activeIndex === index && <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area - 50/50 Split */}
        <div className="flex flex-col lg:flex-row w-full bg-[#1c1c1c] min-h-[500px]">
          {/* Image Section */}
          <div className="relative w-full lg:w-1/2 h-[400px] lg:h-auto overflow-hidden group">
            {/* Using img for external unsplash urls safely without next/image domains config */}
            <img 
              src={activeService.image} 
              alt={activeService.title}
              className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
            />
            
            {/* Left Absolute navigation button */}
            <button 
              onClick={prevService}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-black p-3 md:p-4 z-10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Text Section */}
          <div className="relative w-full lg:w-1/2 flex items-center justify-center p-12 md:p-20 text-center">
            <div className="max-w-[400px] w-full flex flex-col items-center">
              <h3 className="text-3xl md:text-4xl font-light text-white tracking-widest uppercase mb-6">
                {activeService.title}
              </h3>
              
              <p className="text-[#a0a0a0] font-light leading-relaxed mb-10 text-sm md:text-base">
                {activeService.description}
              </p>
              
              {/* <Link 
                href={activeService.link}
                className="bg-white text-black px-8 py-4 text-xs md:text-sm font-bold tracking-[0.2em] uppercase hover:bg-zinc-200 transition-colors flex items-center gap-2"
              >
                FIND OUT MORE 
                <ChevronsRight className="w-4 h-4 ml-1" />
              </Link> */}
            </div>

            {/* Right arrow for next (Desktop) */}
            <button 
              onClick={nextService}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-black p-3 md:p-4 z-10 transition-colors hidden lg:block"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
