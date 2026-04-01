import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'
import { getStaticPosts } from '@/data/staticPosts'

const getPostsSitemap = unstable_cache(
  async () => {
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const posts = getStaticPosts()

    const dateFallback = new Date().toISOString()

    const sitemap = posts
      .filter((post) => Boolean(post.slug))
      .map((post) => ({
        loc: `${SITE_URL}/posts/${post.slug}`,
        lastmod: post.publishedAt || dateFallback,
      }))

    return sitemap
  },
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  return getServerSideSitemap(sitemap)
}
