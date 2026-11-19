const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://autoprestigecars.co.uk'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  // robots.txt is back (31/10/2026; it was switched off on 1/6 because pages had been blocked to AI
  // agents). One rule for every crawler, AI agents included (GPTBot, ClaudeBot, PerplexityBot...):
  // the whole site is allowed, only the two admin logins are not. Same as the other dealer sites.
  generateRobotsTxt: true,
  exclude: [
    '/posts-sitemap.xml', 
    '/pages-sitemap.xml', 
    '/vehicles-sitemap.xml',
    '/vehicles-makes-sitemap.xml',
    '/*', 
    '/posts/*',
    '/usedcars/*' // Exclude dynamic vehicle pages since they're in vehicles-sitemap.xml
  ],
  robotsTxtOptions: {
    policies: [
      {
        // Everything not disallowed is allowed. No "Allow: /" line: crawlers that take the first
        // matching rule would read it as allowing the admin pages too.
        userAgent: '*',
        disallow: ['/websiteadmin', '/stock-admin'],
      },
    ],
    additionalSitemaps: [
      `${SITE_URL}/pages-sitemap.xml`, 
      `${SITE_URL}/posts-sitemap.xml`,
      `${SITE_URL}/vehicles-sitemap.xml`,
      `${SITE_URL}/vehicles-makes-sitemap.xml`
    ],
  },
}
