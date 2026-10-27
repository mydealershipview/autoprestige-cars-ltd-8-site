import type { MetadataRoute } from 'next'
import { getServerSideURL } from '@/utilities/getURL'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/stock-admin', '/api', '/next/seed'] },
    sitemap: [`${getServerSideURL()}/sitemap.xml`, `${getServerSideURL()}/vehicles-sitemap.xml`, `${getServerSideURL()}/vehicles-makes-sitemap.xml`],
  }
}
