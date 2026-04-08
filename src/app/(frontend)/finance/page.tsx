import React, { Suspense } from 'react'
import FinanceApplicationForm from './_components/FinanceApplicationForm'

const FinancePage = () => {
  return (
    <article
      className='pt-24 pb-24 bg-[radial-gradient(circle_at_top,#172233_0%,#0b1220_45%,#05070a_100%)]'>

      <div className='mx-auto w-full max-w-6xl px-4 md:px-6'>
        <h1 className="text-4xl md:text-6xl font-black tracking-[0.14em] uppercase mb-3 text-white text-center">
          Finance Application
        </h1>
        <p className="text-zinc-300 mb-8 text-center">Complete your vehicle finance application</p>

        <div className="mx-auto w-full max-w-4xl space-y-10 rounded-3xl border border-white/10 bg-zinc-950/70 p-5 md:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <section id="finance-terms" className="space-y-4 text-zinc-300 leading-8">
              <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase text-white">
                Finance Application Terms and Conditions
              </h2>
              <p>
                We Deal With All the Major Finance Companies and Banks which means you know we will get the best Finance Rate possible for you. If your credit history is not very good, Don&apos;t worry we have a selective number of Finance Companies who can help.
              </p>
              <p>
                We Will get you tailored made quotes to suit you from Hire Purchase, PCP, Lease Purchase, Balance Payments, Interest Only Deals. Finance Can be taken from 3 Mths to 60 Mths.
              </p>
              <p>
                Alternatively Please contact a Member Of the Sales team who will be more than happy to help.
              </p>
            </section>

            <Suspense fallback={
              <div className="min-h-130 rounded-xl bg-white/5 animate-pulse" />
            }>
              <FinanceApplicationForm />
            </Suspense>
          </div>
      </div>
    </article>
  )
}

export default FinancePage