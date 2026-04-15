import type { Metadata } from 'next'
import React from 'react'
import { notFound } from 'next/navigation'
import PageClient from './page.client'
import { getDealershipInfo } from '@/lib/services/dealership.service'

const staticSlugPages: Record<string, { title: string; paragraphs: string[] }> = {
  about: {
    title: 'About Us',
    paragraphs: [
      'We focus on quality used vehicles, clear communication, and customer-first service at every step.',
      'From first enquiry to handover, our team is here to help you choose the right vehicle with confidence.',
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

  if (!page) {
    notFound()
  }


  return (
    <article className='pt-24 pb-24'>
      <PageClient />

      <div className='container max-w-4xl'>
        <h1 className='text-4xl md:text-6xl font-black tracking-[0.14em] uppercase mb-3'>
          {page.title}
        </h1>

        <div className="space-y-6 text-zinc-200 leading-8">
          {page.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
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
