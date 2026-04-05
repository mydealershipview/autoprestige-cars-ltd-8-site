import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const dateFallback = new Date().toISOString()

    // All static pages from the frontend directory structure
    const staticPages = [
      // Home page
      {
        loc: `${SITE_URL}/`,
        lastmod: dateFallback,
        changefreq: 'daily' as const,
        priority: 1.0,
      },
      // Main category pages
      {
        loc: `${SITE_URL}/used-cars`,
        lastmod: dateFallback,
        changefreq: 'daily' as const,
        priority: 0.9,
      },
      {
        loc: `${SITE_URL}/posts`,
        lastmod: dateFallback,
        changefreq: 'weekly' as const,
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/search`,
        lastmod: dateFallback,
        changefreq: 'weekly' as const,
        priority: 0.7,
      },
      // Service pages
      {
        loc: `${SITE_URL}/finance`,
        lastmod: dateFallback,
        changefreq: 'monthly' as const,
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/warranty`,
        lastmod: dateFallback,
        changefreq: 'monthly' as const,
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/promotions`,
        lastmod: dateFallback,
        changefreq: 'weekly' as const,
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/valuation`,
        lastmod: dateFallback,
        changefreq: 'weekly' as const,
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/reg-plates`,
        lastmod: dateFallback,
        changefreq: 'weekly' as const,
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/profile`,
        lastmod: dateFallback,
        changefreq: 'monthly' as const,
        priority: 0.6,
      },
      // Customer experience pages
      {
        loc: `${SITE_URL}/reviews-and-customer-experience`,
        lastmod: dateFallback,
        changefreq: 'monthly' as const,
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/vacancies`,
        lastmod: dateFallback,
        changefreq: 'monthly' as const,
        priority: 0.6,
      },
      // User features
      {
        loc: `${SITE_URL}/wishlist`,
        lastmod: dateFallback,
        changefreq: 'weekly' as const,
        priority: 0.5,
      },
      {
        loc: `${SITE_URL}/reservation/success`,
        lastmod: dateFallback,
        changefreq: 'monthly' as const,
        priority: 0.3,
      },
      // Legal pages
      {
        loc: `${SITE_URL}/privacy`,
        lastmod: dateFallback,
        changefreq: 'monthly' as const,
        priority: 0.4,
      },
      {
        loc: `${SITE_URL}/terms`,
        lastmod: dateFallback,
        changefreq: 'monthly' as const,
        priority: 0.4,
      },
      {
        loc: `${SITE_URL}/cookies`,
        lastmod: dateFallback,
        changefreq: 'monthly' as const,
        priority: 0.4,
      },
    ]

    console.log(`Generated ${staticPages.length} static page URLs for sitemap`)
    return staticPages
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
    revalidate: 86400, // Revalidate daily since these are static pages
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
