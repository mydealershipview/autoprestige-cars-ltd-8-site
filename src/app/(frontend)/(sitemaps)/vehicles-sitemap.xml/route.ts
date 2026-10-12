import { getServerSideSitemap } from 'next-sitemap'
import { fetchAllAutoTraderListings } from '../../../../utilities/autotrader'
import { generateVehicleSlug } from '../../../../utilities/formatVehicleData'
import { unstable_cache } from 'next/cache'

const getVehiclesSitemap = unstable_cache(
  async () => {
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    // Try MyDealershipView API first
    try {
      console.log('Generating vehicles sitemap from MyDealershipView API...')
      const allVehicles: any[] = []
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
          throw new Error(`MyDealershipView API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        const results = data.data?.vehicles || []
        
        if (results.length > 0) {
          allVehicles.push(...results)
          
          const total = data.data?.pagination?.totalResults || results.length
          const totalPages = Math.ceil(total / 100)
          hasMoreData = currentPage < totalPages
          currentPage++
        } else {
          hasMoreData = false
        }
      }
      
      const dateFallback = new Date().toISOString()

      const sitemap = allVehicles
        .filter((vehicle) => vehicle && vehicle.metadata && vehicle.metadata.stockId)
        .map((vehicle) => {
          const slug = generateVehicleSlug(vehicle)
          return {
            loc: `${SITE_URL}/usedcars/${slug}`,
            lastmod: vehicle.metadata.lastUpdated || dateFallback,
            changefreq: 'weekly' as const,
            priority: 0.8,
          }
        })

      console.log(`Generated ${sitemap.length} vehicle URLs for sitemap from MyDealershipView API`)
      return sitemap
    } catch (error) {
      console.error('MyDealershipView API error:', error)
      
      // Fallback to AutoTrader data
      try {
        console.log('Falling back to AutoTrader API for vehicles sitemap')
        const allVehicles = await fetchAllAutoTraderListings()
        
        const dateFallback = new Date().toISOString()

        const sitemap = allVehicles
          .filter((vehicle) => vehicle && vehicle.metadata && vehicle.metadata.stockId)
          .map((vehicle) => {
            const slug = generateVehicleSlug(vehicle)
            return {
              loc: `${SITE_URL}/usedcars/${slug}`,
              lastmod: vehicle.metadata.lastUpdated || dateFallback,
              changefreq: 'weekly' as const,
              priority: 0.8,
            }
          })

        console.log(`Fallback: Generated ${sitemap.length} vehicle URLs from AutoTrader API`)
        return sitemap
      } catch (autotraderError) {
        console.error('AutoTrader fallback also failed for vehicles sitemap:', autotraderError)
        return []
      }
    }
  },
  ['vehicles-sitemap'],
  {
    tags: ['vehicles-sitemap'],
    revalidate: 3600, // Revalidate every hour
  },
)

export async function GET() {
  const sitemap = await getVehiclesSitemap()

  return getServerSideSitemap(sitemap)
}
