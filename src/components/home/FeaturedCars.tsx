"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function FeaturedCars() {
  const [activeIndex, setActiveIndex] = useState(0)

  // Reliable image URLs that are known to work
  const featured = [
    { 
      id: 1, 
      make: "BMW",
      model: "6 SERIES",
      trim: "3.0 640D M SPORT AUT...",
      price: "£24,995", 
      finance: "£472.07",
      img: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=1000", 
      specs: ["25,000 miles", "Diesel", "Automatic", "Glacier Silver"] 
    },
    { 
      id: 2, 
      make: "MERCEDES-BENZ",
      model: "CLA",
      trim: "1.3 CLA 200 AMG LINE P...",
      price: "£23,295", 
      finance: "£321.79",
      img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000", 
      specs: ["47,000 miles", "Petrol", "Automatic", "Black"] 
    },
    { 
      id: 3, 
      make: "LAND ROVER",
      model: "RANGE ROVER",
      trim: "2.0 RANGE ROVER SPO...",
      price: "£34,995", 
      finance: "£512.73",
      img: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=1000", 
      specs: ["46,000 miles", "Hybrid", "Automatic", "Black"] 
    },
    { 
      id: 4, 
      make: "MERCEDES-BENZ",
      model: "GLC",
      trim: "3.0 AMG GLC 43 4MATIC...",
      price: "£27,995", 
      finance: "£633.78",
      img: "https://images.unsplash.com/photo-1503376760356-5ea0cb52826a?auto=format&fit=crop&q=80&w=1000", 
      specs: ["49,000 miles", "Petrol", "Automatic", "Black"] 
    }
  ]

  return (
    <section className="pt-40 md:pt-48 pb-24 bg-[#121212] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-[0.2em]">
            Latest Arrivals
          </h2>
        </div>

        {/* CSS Grid layout for stable scaling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {featured.map((car) => (
            <div 
              key={car.id} 
              className="bg-[#1c1c1c] flex flex-col group h-full w-full"
            >
              {/* Image Section */}
              <Link href={`/used-cars/${car.id}`} className="aspect-[4/3] w-full overflow-hidden relative block bg-black">
                <img 
                  src={car.img} 
                  alt={`${car.make} ${car.model}`} 
                  className="w-full h-full object-cover group-hover:scale-105 !transition-transform !duration-700 opacity-90 group-hover:opacity-100"
                />
              </Link>

              {/* Content Section */}
              <div className="p-6 md:p-8 flex flex-col flex-grow text-center">
                
                {/* Title */}
                <Link href={`/used-cars/${car.id}`} className="mb-4 block text-white hover:text-zinc-300 !transition-colors">
                  <h3 className="text-[13px] md:text-sm font-light tracking-widest uppercase leading-relaxed">
                    {car.make} {car.model} <br />
                    {car.trim}
                  </h3>
                </Link>
                
                {/* Specs */}
                <div className="flex-grow flex items-center justify-center mb-6">
                  <p className="text-[11px] text-zinc-400 font-light tracking-wide">
                    {car.specs.join(' / ')}
                  </p>
                </div>

                {/* Pricing / Finance Border Container */}
                <div className="flex justify-between items-end border-t border-zinc-800 pt-6 text-white w-full">
                  <div className="text-sm md:text-base font-light tracking-wider">
                    {car.price}
                  </div>
                  <div className="text-right flex items-baseline">
                    <span className="text-lg md:text-xl font-bold tracking-wider">{car.finance}</span>
                    <span className="text-[10px] text-zinc-400 ml-1 mb-1 font-light lowercase">per month</span>
                  </div>
                </div>

              </div>
            </div>
          ))}

        </div>

        {/* Pagination Dots (Desktop / Visual) */}
        <div className="flex justify-center items-center gap-3 mt-12">
          {featured.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`rounded-full !transition-all !duration-300 ${
                activeIndex === idx 
                  ? 'w-2.5 h-2.5 bg-transparent border-[1.5px] border-white' 
                  : 'w-1.5 h-1.5 bg-zinc-600 hover:bg-zinc-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
