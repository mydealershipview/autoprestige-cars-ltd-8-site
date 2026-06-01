import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const serverUrl = getServerSideURL()

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Quality used vehicles, trusted support, and clear dealership information.',
  images: [
    {
      url: `${serverUrl}/website-template-OG.webp`,
      width: 1200,
      height: 630,
      alt: 'Dealership Open Graph Image',
    },
  ],
  siteName: 'Dealership Website',
  title: 'Dealership Website',
  url: serverUrl,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
    url: og?.url || defaultOpenGraph.url,
  }
}
