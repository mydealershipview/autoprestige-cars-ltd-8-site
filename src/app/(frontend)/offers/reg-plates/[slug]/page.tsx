import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  REG_PLATES_PHONE,
} from '@/data/regPlates'
import { getRegPlateBySlugFromDB } from '@/lib/services/regPlates.service'
import RegPlatesSupportFooter from '../_components/RegPlatesSupportFooter'

type RegPlateDetailPageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: RegPlateDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const plate = await getRegPlateBySlugFromDB(slug)

  if (!plate) {
    return {
      title: 'Reg Plate Not Found | Autoprestige',
    }
  }

  return {
    title: `${plate.plate} | Reg Plates | Autoprestige`,
    description: `View details for ${plate.plate} at Autoprestige reg plates.`,
    openGraph: {
      title: `${plate.plate} | Reg Plates | Autoprestige`,
      description: `View details for ${plate.plate} at Autoprestige reg plates.`,
      type: 'website',
      locale: 'en_GB',
    },
  }
}

export default async function RegPlateDetailPage({ params }: RegPlateDetailPageProps) {
  const { slug } = await params
  const plate = await getRegPlateBySlugFromDB(slug)

  if (!plate) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1480px] px-4 pt-28 pb-16">
        <div className="mb-8 border border-blue-800/40 bg-zinc-950 px-4 py-3 text-sm text-white/85 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>
            Telephone: <span className="font-semibold text-white">{REG_PLATES_PHONE}</span>
          </p>
          <Link
            href="/contact"
            className="inline-flex w-fit items-center bg-blue-500 hover:bg-blue-600 !transition-colors px-5 py-2 font-semibold text-white"
          >
            Make an Enquiry
          </Link>
        </div>

        <div className="border border-white/10 bg-[#111111] p-6 md:p-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-wide uppercase mb-6">{plate.plate}</h1>

          <Link
            href="/offers/reg-plates"
            className="inline-block border border-blue-800/60 bg-black px-4 py-2 text-sm font-semibold text-white/90 hover:text-white hover:border-blue-500 !transition-colors"
          >
            {'<<< Go Back'}
          </Link>

          <p className="mt-8 text-3xl md:text-5xl leading-tight font-black text-white/90">
            {plate.details}
          </p>

          <p className="mt-6 text-lg text-white/80">
            Alternatively call us on{' '}
            <a href={`tel:${REG_PLATES_PHONE.replace(/\s+/g, '')}`} className="text-blue-400 hover:underline">
              {REG_PLATES_PHONE}
            </a>
          </p>

          <p className="mt-4 text-xl font-bold uppercase text-white">
            {plate.price == null ? 'PRICE - POA' : `PRICE - £${new Intl.NumberFormat('en-GB').format(plate.price)}`}
          </p>

          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="text-lg text-white/75">{plate.teaser}</p>
          </div>
        </div>

        <RegPlatesSupportFooter />
      </div>
    </div>
  )
}
