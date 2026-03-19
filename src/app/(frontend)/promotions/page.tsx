import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PayloadRedirects } from '@/components/payload/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/payload/LivePreviewListener'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function PromotionsPage() {
  const { isEnabled: draft } = await draftMode()
  const url = '/promotions'

  const page = await queryPromotionsPage()

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  // Check if promotions page is enabled
  if (page.template !== 'promotions') {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryPromotionsPage()

  if (page) {
    return generateMeta({ doc: page })
  }

  return {
    title: 'Promotions - MYDV Autos | Special Offers on Used Cars',
    description: 'Check out our current special offers and promotions on used cars, warranties, and finance deals at MYDV Autos.',
  }
}

const queryPromotionsPage = cache(async () => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      template: {
        equals: 'promotions',
      },
    },
  })

  return result.docs?.[0] || null
})
