export function LegacyText() {
  return (
    <section className="bg-[#121212] py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-5xl mx-auto text-center">
        
        <h2 className="text-3xl md:text-5xl lg:text-[40px] leading-tight font-light text-white tracking-widest uppercase mb-6">
          WHERE DISCERNING DRIVERS FIND THEIR AUTOMOTIVE LEGACY
        </h2>
        
        <p className="text-lg md:text-xl text-zinc-300 font-medium mb-12">
          A Discerning Collection. An Unwavering Passion.
        </p>

        <div className="space-y-8 text-zinc-400 font-light text-base md:text-lg leading-relaxed max-w-4xl mx-auto">
          <p>
            We are not an ordinary car dealership. We cater to discerning drivers who view automobiles not just as transportation, but as a cherished extension of personal taste. Our passion for automotive design and engineering runs deep, ensuring exceptional vehicles find their way into our curated collection.
          </p>

          <h3 className="text-white font-medium text-lg mt-12 mb-6">
            Exclusivity Redefined
          </h3>

          <p>
            From iconic Range Rovers to the pinnacle of Italian craftsmanship in Ferrari and Lamborghini, our inventory features the most coveted marques, each meticulously maintained and presented.
          </p>

          <div className="relative">
            <p className="opacity-40">
              Bespoke Customisation: We offer a bespoke service, allowing you to tailor a vehicle to your exact specifications, from unique interior trims to performance upgrades, helping you express your individuality.
            </p>
            
            {/* Gradient overlay to simulate fade out effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212] pointer-events-none" />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button className="text-white font-semibold text-lg tracking-wider hover:text-zinc-300 transition-colors">
            Read More
          </button>
        </div>
      </div>
    </section>
  )
}
