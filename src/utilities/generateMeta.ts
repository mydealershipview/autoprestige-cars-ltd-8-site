import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { getDealershipInfo } from '@/lib/services/dealership.service'
import { siteDescription } from '@/utilities/dealershipInfo'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args
  const dealership = await getDealershipInfo()

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title
    ? `${doc?.meta?.title} | ${dealership.name}`
    : dealership.name

  const description =
    // Website admin "SEO text" not in use (20/11/2026); to use it again: doc?.meta?.description || dealership.seoText || ...
    doc?.meta?.description || siteDescription(dealership)

  return {
    description,
    openGraph: mergeOpenGraph({
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      siteName: dealership.name,
      url: typeof doc?.slug === 'string' ? `/${doc.slug}` : '/',
    }),
    title,
  }
}
