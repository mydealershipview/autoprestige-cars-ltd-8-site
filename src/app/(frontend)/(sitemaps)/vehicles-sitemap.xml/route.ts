import { getServerSideSitemap } from 'next-sitemap'
import { getDmsWebsiteVehicles } from '@/lib/services/dmsWebsiteStock'
import { generateVehicleSlug } from '@/utilities/formatVehicleData'
import { getServerSideURL } from '@/utilities/getURL'
export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const vehicles = await getDmsWebsiteVehicles('live')
    return getServerSideSitemap(vehicles.map(vehicle => ({
      loc: `${getServerSideURL()}/usedcars/${generateVehicleSlug(vehicle)}`,
      lastmod: vehicle.metadata.lastUpdated || new Date().toISOString(),
    })))
  } catch {
    console.error('Vehicle sitemap stock feed unavailable')
    return new Response('Stock feed unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
