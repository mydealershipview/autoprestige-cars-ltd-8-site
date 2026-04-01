import React from 'react'
import type { Metadata } from 'next'
import { getDealershipInfo } from '@/lib/services/dealership.service'

const roles = [
  {
    title: 'Sales Executive',
    summary: 'Guide customers from first enquiry to handover with clear and professional communication.',
  },
  {
    title: 'Vehicle Preparation Technician',
    summary: 'Support vehicle preparation standards across inspections, handover checks, and presentation.',
  },
  {
    title: 'Customer Service Advisor',
    summary: 'Coordinate appointments and customer updates across sales, finance, and aftersales touchpoints.',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Vacancies | ${dealership.name}`,
    description:
      dealership.seoText ||
      `Explore current career opportunities at ${dealership.name} and join our growing dealership team.`,
    keywords: ['jobs', 'automotive careers', dealership.name, dealership.address.city]
      .filter(Boolean)
      .join(', '),
    openGraph: {
      title: `Vacancies | ${dealership.name}`,
      description: `Explore available roles at ${dealership.name}.`,
      type: 'website',
      locale: 'en_GB',
    },
  }
}

const VacanciesPage = async () => {
  const dealership = await getDealershipInfo()

  return (
    <main className="min-h-screen bg-black text-white px-6 pt-28 pb-20">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-4xl md:text-6xl font-black tracking-[0.16em] uppercase mb-6">Vacancies</h1>
        <p className="text-white/70 max-w-3xl mb-12">
          {`Interested in joining ${dealership.name}? Explore our current opportunities and send your CV to ${dealership.email || 'our team'}.`}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <article key={role.title} className="border border-white/20 p-6">
              <h2 className="text-xl font-bold uppercase tracking-wide mb-3">{role.title}</h2>
              <p className="text-white/70 text-sm leading-relaxed">{role.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

export default VacanciesPage
