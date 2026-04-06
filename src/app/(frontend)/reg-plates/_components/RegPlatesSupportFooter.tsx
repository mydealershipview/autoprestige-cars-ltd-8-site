import Link from 'next/link'
import {
  REG_PLATES_LOCATION_LINES,
  REG_PLATES_OPENING_TIMES,
  REG_PLATES_PHONE,
} from '@/data/regPlates'

export default function RegPlatesSupportFooter() {
  return (
    <section className="mt-12 border-y border-white/10 bg-black">
      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-white/10">
        <article className="px-8 py-10 text-center border-b md:border-b-0 md:border-r border-white/10 bg-[#101010]">
          <h3 className="text-3xl font-light text-white leading-none">Contact</h3>
          <p className="text-4xl font-semibold text-white mb-4 leading-none">Details</p>
          <p className="text-sm uppercase tracking-widest text-white/65 mb-1">Telephone:</p>
          <a
            href={`tel:${REG_PLATES_PHONE.replace(/\s+/g, '')}`}
            className="text-3xl font-semibold text-white hover:text-blue-400 !transition-colors"
          >
            {REG_PLATES_PHONE}
          </a>
          <div className="mt-4">
            <Link href="/contact" className="text-white/85 hover:text-blue-400 !transition-colors">
              Contact Us &gt;
            </Link>
          </div>
        </article>

        <article className="px-8 py-10 text-center border-b md:border-b-0 md:border-r border-white/10 bg-[#101010]">
          <h3 className="text-3xl font-light text-white leading-none">Our</h3>
          <p className="text-4xl font-semibold text-white mb-4 leading-none">Location</p>
          <div className="space-y-1 text-lg text-white/85">
            {REG_PLATES_LOCATION_LINES.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="mt-4">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Rosse+Street+Bradford+West+Yorkshire+BD8+9AS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/85 hover:text-blue-400 !transition-colors"
            >
              Get Directions &gt;
            </a>
          </div>
        </article>

        <article className="px-8 py-10 text-center bg-[#101010]">
          <h3 className="text-3xl font-light text-white leading-none">Opening</h3>
          <p className="text-4xl font-semibold text-white mb-4 leading-none">Times</p>
          <ul className="space-y-2 text-lg text-white/85">
            {REG_PLATES_OPENING_TIMES.map((time) => (
              <li key={time}>{time}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="px-8 py-10 space-y-4 text-sm text-white/70">
        <p className="text-white/80">Autoprestige Cars - cars</p>
        <p>
          <Link href="/privacy" className="hover:text-blue-400 !transition-colors">
            Privacy Policy
          </Link>{' '}
          |{' '}
          <Link href="/cookies" className="hover:text-blue-400 !transition-colors">
            Cookie Policy
          </Link>
        </p>
        <p>Copyright (c) 2026 Autoprestige Cars. All Rights Reserved.</p>
        <p>VAT Number - GB 219955471 | Company Number - 9681013 | FCA Number - 715892</p>
        <p>
          Disclosure: Whilst every care has been taken to ensure all of the information on this
          site is accurate, please always check with your dealer as errors can occur.
        </p>
        <p>
          We act as a credit broker not a lender. We work with a number of carefully selected
          credit providers who typically will be able to offer you finance for your purchase.
          (Written quotations available on request). Whichever lender we introduce you to, we will
          typically receive a fee from them (either a fixed fee or a percentage of the amount you
          borrow). The lenders we work with could pay commissions at different rates. All finance
          is subject to status and income. Terms and conditions apply. Applicants must be 18 years
          or over.
        </p>
        <p>Autoprestige is the trading name of Cars Unlimited Ltd</p>
      </div>
    </section>
  )
}
