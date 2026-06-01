const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://template-8.mydealershipview.com'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: false,
  exclude: [
    '/posts-sitemap.xml', 
    '/pages-sitemap.xml', 
    '/vehicles-sitemap.xml',
    '/vehicles-makes-sitemap.xml',
    '/*', 
    '/posts/*',
    '/used-cars/*' // Exclude dynamic vehicle pages since they're in vehicles-sitemap.xml
  ],
  robotsTxtOptions: {
    additionalSitemaps: [
      `${SITE_URL}/pages-sitemap.xml`, 
      `${SITE_URL}/posts-sitemap.xml`,
      `${SITE_URL}/vehicles-sitemap.xml`,
      `${SITE_URL}/vehicles-makes-sitemap.xml`
    ],
  },
}
