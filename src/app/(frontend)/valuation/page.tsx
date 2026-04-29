import type { Metadata } from 'next'
import ValuationForm from './_components/ValuationForm'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Vehicle Valuation | ${dealership.name}`,
    description:
      dealership.seoText ||
      `Request a vehicle valuation from ${dealership.name}. Submit your vehicle details online and our team will get back to you promptly.`,
    openGraph: {
      title: `Vehicle Valuation | ${dealership.name}`,
      description:
        'Get a competitive valuation estimate by submitting your current vehicle details online.',
      type: 'website',
      locale: 'en_GB',
    },
  }
}

const highlights = [
  {
    title: 'Fast Response',
    description: 'Most valuation enquiries are reviewed by our team within one working day.',
  },
  {
    title: 'Competitive Offers',
    description:
      'We benchmark against current market demand to provide fair and transparent pricing.',
  },
  {
    title: 'Simple Process',
    description:
      'Send your details online, then we confirm figures and next steps with no pressure.',
  },
]

export default async function ValuationPage() {
  const dealership = await getDealershipInfo()

  return (
    <div className="bg-black text-white min-h-screen">
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: '56vh', paddingTop: '5rem' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/car_3.png')" }}
        />
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative z-10 text-center px-4 max-w-3xl">
          <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-blue-400 mb-4 font-semibold">
            Vehicle Valuation
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-[0.16em] uppercase text-white mb-5">
            Sell Your Car
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Share your vehicle details and our team at {dealership.name} will contact you with a
            competitive valuation.
          </p>

          <div className="flex items-center justify-center gap-0 mx-auto w-36 mt-8">
            <div className="h-[3px] flex-1 bg-blue-500" />
            <div className="w-4 h-4 bg-blue-500 rotate-45 -mx-1" />
            <div className="h-[3px] flex-1 bg-blue-500" />
          </div>
        </div>
      </section>

      <section className="py-14 px-4 border-y border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {highlights.map((item) => (
            <article key={item.title} className="border border-white/10 bg-white/[0.02] p-6">
              <h2 className="text-sm font-black tracking-widest uppercase mb-3 text-white">
                {item.title}
              </h2>
              <p className="text-sm leading-relaxed text-white/70">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.95fr,1.25fr] gap-8">
          <aside className="border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-8 h-fit">
            <h2 className="text-xl font-black tracking-widest uppercase mb-3">Before You Submit</h2>
            <div className="h-[2px] w-16 bg-blue-500 mb-6" />

            <ul className="space-y-3 text-sm text-white/75 leading-relaxed">
              <li className="flex gap-3">
                <span className="text-blue-400">01.</span>
                Include accurate mileage and registration for a more precise first estimate.
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400">02.</span>
                Mention service history or recent work in the notes box.
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400">03.</span>
                Add your preferred contact details so we can reach you quickly.
              </li>
            </ul>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-xs uppercase tracking-widest text-white/60 mb-2">Need help now?</p>
              <a
                href={dealership.phone ? `tel:${dealership.phone.replace(/\s+/g, '')}` : '#'}
                className="text-white font-semibold tracking-wide hover:text-blue-400 !transition-colors"
              >
                {dealership.phone || 'Call our team'}
              </a>
            </div>
          </aside>

          <div className="border border-white/10 p-7 md:p-10 bg-black/60">
            <h2 className="text-2xl font-black tracking-widest uppercase mb-1">Request Your Valuation</h2>
            <div className="h-[2px] w-full bg-white/10 mb-8" />
            <ValuationForm />
          </div>
        </div>
      </section>
    </div>
  )
}
