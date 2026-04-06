import type { Metadata } from 'next'
import Link from 'next/link'
import {
  REG_PLATES,
  REG_PLATES_MOBILE,
  REG_PLATES_PHONE,
  REG_PLATES_TEASER,
} from '@/data/regPlates'
import RegPlatesSupportFooter from './_components/RegPlatesSupportFooter'

export const dynamic = 'force-static'
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Reg Plates | Autoprestige',
  description: 'Browse static reg plates for sale at Autoprestige and view each plate details.',
  openGraph: {
    title: 'Reg Plates | Autoprestige',
    description: 'Browse static reg plates for sale at Autoprestige.',
    type: 'website',
    locale: 'en_GB',
  },
}

export default function RegPlatesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1480px] px-4 pt-28 pb-16">
        <div className="mb-8 border border-red-900/40 bg-zinc-950 px-4 py-3 text-sm text-white/85">
          <p>
            Telephone: <span className="font-semibold text-white">{REG_PLATES_PHONE}</span> Mobile:{' '}
            <span className="font-semibold text-white">{REG_PLATES_MOBILE}</span>
          </p>
          <p className="mt-1 text-white/60">Autoprestige Cars - Used cars in Bradford</p>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-wide uppercase mb-8">
          REG PLATES AT AUTOPRESTIGE
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {REG_PLATES.map((plate) => (
            <Link
              key={plate.slug}
              href={`/reg-plates/${plate.slug}`}
              className="group border border-white/10 bg-[#111111] hover:border-red-600/50 !transition-colors min-h-[420px] p-4 flex flex-col"
            >
              <div className="flex-1" />
              <h2 className="text-center text-4xl font-black tracking-wide uppercase text-white">
                {plate.plate}
              </h2>
              <p className="mt-4 text-center text-white/75 leading-relaxed text-lg">
                {REG_PLATES_TEASER}
              </p>
              <span className="mt-6 w-full bg-red-600 group-hover:bg-red-700 !transition-colors text-white text-center font-semibold tracking-wide py-3">
                More Details
              </span>
            </Link>
          ))}
        </div>

        <RegPlatesSupportFooter />
      </div>
    </div>
  )
}
