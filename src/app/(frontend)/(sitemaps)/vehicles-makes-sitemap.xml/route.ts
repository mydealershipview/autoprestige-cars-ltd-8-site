import { getServerSideSitemap } from 'next-sitemap'
import { fetchAutoTraderListings } from '../../../../utilities/autotrader'
import { extractMakesAndModelsFromVehicles } from '../../../../utilities/make-model'
import { unstable_cache } from 'next/cache'

// Helper function to properly encode URLs for XML
const xmlEncodeUrl = (url: string) => {
  return url.replace(/&/g, '&amp;')
}

const getVehiclesMakesSitemap = unstable_cache(
  async () => {
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    try {
      console.log('Generating vehicles makes sitemap from MyDealershipView API...')

      const allListings: any[] = []
      let currentPage = 1
      let hasMoreData = true

      while (hasMoreData) {
        const myDealershipUrl = `${process.env.DMS_URL}?dealerEmail=${process.env.DEALER_EMAIL}&pageSize=100&page=${currentPage}`

        const response = await fetch(myDealershipUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(
            `MyDealershipView API error: ${response.status} ${response.statusText}`
          )
        }

        const data = await response.json()
        const results = data.data?.vehicles || []

        if (results.length > 0) {
          allListings.push(...results)

          const total = data.data?.pagination?.totalResults || results.length
          const totalPages = Math.ceil(total / 100)
          hasMoreData = currentPage < totalPages
          currentPage++
        } else {
          hasMoreData = false
        }
      }

      const { makes } = extractMakesAndModelsFromVehicles(allListings)
      const dateFallback = new Date().toISOString()

      const sitemap = [
        {
          loc: `${SITE_URL}/usedcars`,
          lastmod: dateFallback,
          changefreq: 'daily' as const,
          priority: 0.9,
        },
        ...makes.map((make) => ({
          loc: xmlEncodeUrl(
            `${SITE_URL}/usedcars?make=${encodeURIComponent(make.name)}`
          ),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.7,
        })),
        {
          loc: xmlEncodeUrl(`${SITE_URL}/usedcars?fuelType=Petrol`),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.6,
        },
        {
          loc: xmlEncodeUrl(`${SITE_URL}/usedcars?fuelType=Diesel`),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.6,
        },
        {
          loc: xmlEncodeUrl(`${SITE_URL}/usedcars?fuelType=Electric`),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.6,
        },
        {
          loc: xmlEncodeUrl(`${SITE_URL}/usedcars?fuelType=Hybrid`),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.6,
        },
        {
          loc: xmlEncodeUrl(
            `${SITE_URL}/usedcars?transmissionType=Automatic`
          ),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.6,
        },
        {
          loc: xmlEncodeUrl(
            `${SITE_URL}/usedcars?transmissionType=Manual`
          ),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.6,
        },
        {
          loc: xmlEncodeUrl(`${SITE_URL}/usedcars?bodyType=Hatchback`),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.5,
        },
        {
          loc: xmlEncodeUrl(`${SITE_URL}/usedcars?bodyType=Saloon`),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.5,
        },
        {
          loc: xmlEncodeUrl(`${SITE_URL}/usedcars?bodyType=Estate`),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.5,
        },
        {
          loc: xmlEncodeUrl(`${SITE_URL}/usedcars?bodyType=SUV`),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.5,
        },
        {
          loc: xmlEncodeUrl(`${SITE_URL}/usedcars?maxPrice=10000`),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.5,
        },
        {
          loc: xmlEncodeUrl(
            `${SITE_URL}/usedcars?minPrice=10000&maxPrice=20000`
          ),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.5,
        },
        {
          loc: xmlEncodeUrl(`${SITE_URL}/usedcars?minPrice=20000`),
          lastmod: dateFallback,
          changefreq: 'weekly' as const,
          priority: 0.5,
        },
      ]

      return sitemap
    } catch (error) {
      console.error('MyDealershipView API error:', error)

      try {
        console.log('Falling back to AutoTrader API')

        const allListings: any[] = []
        let page = 1
        let hasMoreData = true
        const pageSize = 100

        while (hasMoreData) {
          const response = await fetchAutoTraderListings({
            page,
            pageSize,
          })

          if (response.results?.length) {
            allListings.push(...response.results)

            const totalPages = Math.ceil(
              response.totalResults / pageSize
            )
            hasMoreData = page < totalPages
            page++
          } else {
            hasMoreData = false
          }
        }

        const { makes } =
          extractMakesAndModelsFromVehicles(allListings)
        const dateFallback = new Date().toISOString()

        return [
          {
            loc: `${SITE_URL}/usedcars`,
            lastmod: dateFallback,
            changefreq: 'daily' as const,
            priority: 0.9,
          },
          ...makes.map((make) => ({
            loc: xmlEncodeUrl(
              `${SITE_URL}/usedcars?make=${encodeURIComponent(make.name)}`
            ),
            lastmod: dateFallback,
            changefreq: 'weekly' as const,
            priority: 0.7,
          })),
        ]
      } catch (autotraderError) {
        console.error(
          'AutoTrader fallback also failed:',
          autotraderError
        )

        const dateFallback = new Date().toISOString()
        const commonMakes = [
          'Audi',
          'BMW',
          'Mercedes-Benz',
          'Volkswagen',
          'Ford',
          'Toyota',
          'Honda',
          'Nissan',
          'Vauxhall',
          'Peugeot',
        ]

        return [
          {
            loc: `${SITE_URL}/usedcars`,
            lastmod: dateFallback,
            changefreq: 'daily' as const,
            priority: 0.9,
          },
          ...commonMakes.map((make) => ({
            loc: xmlEncodeUrl(
              `${SITE_URL}/usedcars?make=${encodeURIComponent(make)}`
            ),
            lastmod: dateFallback,
            changefreq: 'weekly' as const,
            priority: 0.7,
          })),
        ]
      }
    }
  },
  ['vehicles-makes-sitemap']
)

export async function GET() {
  const sitemap = await getVehiclesMakesSitemap()
  return getServerSideSitemap(sitemap)
}
