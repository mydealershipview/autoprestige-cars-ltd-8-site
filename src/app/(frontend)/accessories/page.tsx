import React from 'react'

export const metadata = {
  title: 'Accessories | MYDV autos',
  description: 'Riviera Automotive can take your vehicle to the next level with our available accessories, including alloys, body kits and exhausts.',
}

export default function AccessoriesPage() {
  return (
    <main className="min-h-screen bg-[#111111] text-white pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] md:h-[700px] flex items-center">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=1920&q=80"
            alt="Audi RS6 Accessories"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-[1700px] mx-auto px-6 w-full mt-10 md:mt-20">
          <div className="bg-[#1a1a1a]/95 max-w-lg p-10 md:p-14 border border-white/5">
            <h1 className="text-3xl md:text-5xl tracking-[0.2em] font-light uppercase mb-6 leading-tight text-center md:text-left">
              Accessories
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed font-light text-center md:text-left">
              Riviera Automotive can take your vehicle to the next level with our available accessories, including alloys, body kits, and exhausts.
            </p>
          </div>
        </div>
      </section>

      {/* Info Sections */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        
        <div className="mb-16 border-b border-white/10 pb-16">
          <p className="text-sm text-zinc-400 font-light mb-16">
            Discover the full range of accessories available for your vehicle at Riviera Automotive
          </p>

          <h2 className="text-xl md:text-2xl tracking-widest uppercase mb-2">
            Alloys
          </h2>
          <h3 className="text-sm md:text-base text-zinc-200 tracking-wider uppercase mb-6">
            Elevate your vehicle with Riviera Automotive alloys
          </h3>
          <p className="text-sm text-zinc-400 font-light mb-4">
            Experience the pinnacle of automotive elegance with Riviera Automotive&apos;s premium alloy wheels. Crafted with meticulous attention to detail, our wheels are designed to enhance the prestige and sophistication of your vehicle.
          </p>
          <p className="text-sm text-zinc-400 font-light mb-4">
            Whether you own a luxury SUV like the Range Rover or a high-performance sports car, Riviera alloys offer a perfect blend of style and durability. Our extensive range features a variety of designs, from classic five-spoke patterns to contemporary multi-spoke configurations, ensuring you find the ideal match for your taste.
          </p>
          <p className="text-sm text-zinc-400 font-light mb-4">
            Beyond aesthetics, Riviera wheels are engineered to deliver exceptional performance. Precisely machined and rigorously tested, our alloys provide superior strength, handling, and ride quality.
          </p>
          <p className="text-sm text-zinc-400 font-light">
            Invest in Riviera Automotive alloys and elevate your vehicle to new heights of luxury and style.
          </p>
          {/* Note: Wheels button excluded as requested */}
        </div>

        <div className="mb-16 border-b border-white/10 pb-16">
          <h2 className="text-xl md:text-2xl tracking-widest uppercase mb-2">
            Body Kits
          </h2>
          <h3 className="text-sm md:text-base text-zinc-200 tracking-wider uppercase mb-6">
            Enhance your vehicle&apos;s aesthetic with Riviera Automotive body kits
          </h3>
          <p className="text-sm text-zinc-400 font-light mb-4">
            Elevate your vehicle&apos;s appearance with Riviera Automotive&apos;s high-quality body kits. Crafted from durable polyurethane plastic, our kits offer superior strength and longevity compared to traditional fibreglass options.
          </p>
          <p className="text-sm text-zinc-400 font-light mb-4">
            To complete the transformation, complement your body kit with our selection of premium alloy wheels, tires, and interior accessories.
          </p>
          <p className="text-sm text-zinc-400 font-light">
            Contact our team today to learn more about how Riviera Automotive can help you achieve your desired vehicle aesthetic.
          </p>
        </div>

        <div>
          <h2 className="text-xl md:text-2xl tracking-widest uppercase mb-2">
            Exhausts
          </h2>
          <h3 className="text-sm md:text-base text-zinc-200 tracking-wider uppercase mb-6">
            Experience unparalleled performance with Riviera Automotive exhaust systems
          </h3>
          <p className="text-sm text-zinc-400 font-light mb-4">
            Riviera Automotive is dedicated to crafting exhaust systems that deliver exceptional power, captivating sound, and unmatched versatility. Our valvetronic systems, meticulously engineered with precision and innovation, set a new standard for performance and sound quality.
          </p>
          <p className="text-sm text-zinc-400 font-light mb-4">
            Drawing on the expertise of our German and Japanese engineers, Riviera Automotive is at the forefront of exhaust system design and manufacturing. With a commitment to excellence, we have established ourselves as a leading provider of high-performance exhaust systems in the automotive aftermarket.
          </p>
          <p className="text-sm text-zinc-400 font-light">
            Discover the difference that a Riviera Automotive exhaust system can make for your vehicle.
          </p>
        </div>

      </section>
    </main>
  )
}
