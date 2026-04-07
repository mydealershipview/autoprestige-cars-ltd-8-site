import type { Metadata } from 'next'
import React from 'react'
import { notFound } from 'next/navigation'
import PageClient from './page.client'
import { getDealershipInfo } from '@/lib/services/dealership.service'
import FinanceApplicationForm from './_components/FinanceApplicationForm'

const staticSlugPages: Record<string, { title: string; paragraphs: string[] }> = {
  about: {
    title: 'About Us',
    paragraphs: [
      'We focus on quality used vehicles, clear communication, and customer-first service at every step.',
      'From first enquiry to handover, our team is here to help you choose the right vehicle with confidence.',
    ],
  },
  finance: {
    title: 'Apply for Finance',
    paragraphs: [
      'Flexible finance options are available to help spread the cost of your next vehicle.',
      'Our team can guide you through available options and explain monthly payment structures clearly.',
    ],
  },
  sell: {
    title: 'Sell Your Car',
    paragraphs: [
      'Looking to sell your vehicle? Request a valuation and our team will be in touch.',
      'We make the process straightforward with clear communication and quick feedback.',
    ],
  },
  'reviews-and-customer-experience': {
    title: 'Reviews And Customer Experience',
    paragraphs: [
      'Customer feedback is central to how we improve service quality and support.',
      'Read reviews and discover what buyers say about their experience with our dealership.',
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(staticSlugPages).map((slug) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const page = staticSlugPages[slug]
  const isFinancePage = slug === 'finance'

  if (!page) {
    notFound()
  }


  return (
    <article
      className={
        isFinancePage
          ? 'pt-24 pb-24 bg-[radial-gradient(circle_at_top,#172233_0%,#0b1220_45%,#05070a_100%)]'
          : 'pt-24 pb-24'
      }
    >
      <PageClient />

      <div className={isFinancePage ? 'mx-auto w-full max-w-6xl px-4 md:px-6' : 'container max-w-4xl'}>
        <h1 className={`text-4xl md:text-6xl font-black tracking-[0.14em] uppercase mb-3 ${isFinancePage ? 'text-white text-center' : ''}`}>
          {isFinancePage ? 'Finance Application' : page.title}
        </h1>
        {isFinancePage && <p className="text-zinc-300 mb-8 text-center">Complete your vehicle finance application</p>}

        {isFinancePage ? (
          <div className="mx-auto w-full max-w-4xl space-y-10 rounded-3xl border border-white/10 bg-zinc-950/70 p-5 md:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <section id="finance-terms" className="space-y-4 text-zinc-300 leading-8">
              <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase text-white">
                Finance Application Terms and Conditions
              </h2>
              <p>
                By completing the application for vehicle finance below, you give us, Autoprestige Cars, the authority to request your credit history from credit reference agencies (&quot;CRAs&quot;) and that you agree to be subject to one or multiple full (&quot;hard&quot;) credit searches on your credit report.
              </p>
              <p>
                These hard searches includes information like your credit score, credit report and data related to them, such as credit providers, county court judgments (&quot;CCJs&quot;) and reasons for changes to your score or report. Hard searches are visible to third parties.
              </p>
              <p>
                When you submit the application, one or more hard credit searches will be performed and your eligibility for vehicle finance will be considered by our carefully selected panel of lenders. Each has their own acceptance criteria and will consider affordability elements that a credit search may not. Lenders will assess your ability to repay the finance provided, now and in the future, including in the event of a change in circumstances or the general market, such as an interest rate change.
              </p>
              <p>
                Before proceeding, please note that multiple hard credit searches in close proximity to each other can detrimentally impact your credit score. Lenders and credit scoring models consider how many hard credit searches you have on your credit reports. This is because applications for new credit increase the risk a borrower poses to lenders. Be mindful of submitting multiple finance applications in a short window of time.
              </p>
            </section>

            <FinanceApplicationForm />
          </div>
        ) : (
          <div className="space-y-6 text-zinc-200 leading-8">
            {page.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const dealership = await getDealershipInfo()
  const page = staticSlugPages[slug]
  const titleText =
    page?.title ||
    slug
      .split('-')
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ') ||
    'Page'

  return {
    title: `${titleText} | ${dealership.name}`,
    description: page?.paragraphs[0] || dealership.seoText,
  }
}
