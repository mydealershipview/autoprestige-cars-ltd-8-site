import { getServerSideSitemap } from 'next-sitemap'
import { getDmsWebsiteVehicles } from '@/lib/services/dmsWebsiteStock'
import { getServerSideURL } from '@/utilities/getURL'
export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const vehicles = await getDmsWebsiteVehicles('live')
    const makes = [...new Set(vehicles.map(v => v.vehicle.make).filter(Boolean))]
    return getServerSideSitemap(makes.map(make => ({ loc: `${getServerSideURL()}/usedcars?make=${encodeURIComponent(make)}` })))
  } catch {
    console.error('Makes sitemap stock feed unavailable')
    return new Response('Stock feed unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
