import React from 'react'
import type { Metadata } from 'next'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export const dynamic = 'force-static'
export const revalidate = 600

const promotions = [
  {
    title: 'Finance Package Review',
    description:
      'Ask our team about current finance options tailored around your monthly budget and preferred term.',
  },
  {
    title: 'Part Exchange Support',
    description:
      'Bring your current car for valuation and use it toward your next vehicle with a straightforward process.',
  },
  {
    title: 'Extended Warranty Options',
    description:
      'Add longer-term warranty coverage at point of sale for additional peace of mind.',
  },
]

export default async function PromotionsPage() {
  const dealership = await getDealershipInfo()

  return (
    <main className="min-h-screen bg-black text-white px-6 pt-28 pb-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl md:text-6xl font-black tracking-[0.14em] uppercase mb-6">Promotions</h1>
        <p className="text-white/70 mb-10 max-w-3xl">
          {`Current promotional highlights from ${dealership.name}. Contact our team for availability and full terms.`}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {promotions.map((promotion) => (
            <article key={promotion.title} className="border border-white/20 p-6">
              <h2 className="text-lg font-bold uppercase tracking-wide mb-3">{promotion.title}</h2>
              <p className="text-sm text-white/70 leading-relaxed">{promotion.description}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Promotions | ${dealership.name}`,
    description:
      dealership.seoText ||
      `View current promotions and offers available from ${dealership.name}.`,
  }
}
