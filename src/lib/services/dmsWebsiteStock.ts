import { isLiveListing } from '@/utilities/websiteVehicleStatus'
import type { AutoTraderVehicle } from '@/utilities/autotrader'

export type WebsiteVehicle = AutoTraderVehicle & {
  lifecycleState?: string
  websiteOnly?: boolean
  sourceStockId?: string
  reserved?: boolean
  soldAt?: string | null
}

type Kind = 'live' | 'sold' | 'reserved'
const CACHE_MS = 60_000
const MAX_PAGES = 100
const caches = new Map<string, { expires: number; vehicles: WebsiteVehicle[] }>()
const pending = new Map<string, Promise<WebsiteVehicle[]>>()

/** All website stock comes from the public DMS allow-list. No provider/archive fallback: an
 * outage must never resurrect an unticked sold advert or turn into a believable empty showroom. */
export function websiteStockUrl(kind: Kind, page = 1, pageSize = 100): URL {
  if (!process.env.DMS_URL || !process.env.DEALER_EMAIL) throw new Error('Website stock configuration is missing')
  const url = new URL(process.env.DMS_URL)
  url.searchParams.set('dealerEmail', process.env.DEALER_EMAIL)
  for (const key of ['status', 'includeReserved', 'lifecycleState']) url.searchParams.delete(key)
  if (kind === 'reserved') url.pathname = url.pathname.replace(/\/stock\/?$/, '/reserved-ads')
  url.searchParams.set(kind === 'sold' ? 'status' : 'includeReserved', kind === 'sold' ? 'sold' : 'true')
  url.searchParams.set('page', String(page))
  url.searchParams.set('pageSize', String(pageSize))
  return url
}

async function readPage(kind: Kind, page: number) {
  const response = await fetch(websiteStockUrl(kind, page), { cache: 'no-store', signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error('Website stock feed unavailable')
  const body = await response.json()
  const data = body?.data
  if (body?.success === false || !Array.isArray(data?.vehicles) ||
      !Number.isInteger(data?.pagination?.totalPages) || data.pagination.totalPages < 0 ||
      data.pagination.totalPages > MAX_PAGES) throw new Error('Invalid website stock feed')
  const vehicles = (data.vehicles as WebsiteVehicle[]).map(vehicle => {
    if (!vehicle?.metadata?.stockId || !vehicle.vehicle || !vehicle.adverts) throw new Error('Invalid website vehicle')
    const lifecycleState = vehicle.lifecycleState ?? vehicle.metadata.lifecycleState
    return {
      ...vehicle,
      metadata: { ...vehicle.metadata, lifecycleState },
      media: { ...vehicle.media, images: (vehicle.media?.images ?? []).flatMap(image => {
        const href = image.href || (image as { url?: string }).url
        return href ? [{ ...image, href: href.replace('{resize}', 'w800') }] : []
      }) },
    }
  })
  return { vehicles, totalPages: data.pagination.totalPages as number }
}

export async function getDmsWebsiteVehicles(kind: Kind): Promise<WebsiteVehicle[]> {
  const key = websiteStockUrl(kind).toString()
  const cached = caches.get(key)
  if (cached && cached.expires > Date.now()) return cached.vehicles
  const inflight = pending.get(key)
  if (inflight) return inflight
  const request = (async () => {
    const first = await readPage(kind, 1)
    const vehicles = [...first.vehicles]
    // Four pages at a time: avoids serial latency and unbounded upstream concurrency.
    for (let page = 2; page <= first.totalPages; page += 4) {
      const pages = await Promise.all(Array.from({ length: Math.min(4, first.totalPages - page + 1) },
        (_, offset) => readPage(kind, page + offset)))
      for (const result of pages) vehicles.push(...result.vehicles)
    }
    if (kind === 'live') {
      const reserved = await getDmsWebsiteVehicles('reserved')
      const retainedSources = new Set(reserved.map(vehicle => vehicle.sourceStockId))
      vehicles.splice(0, vehicles.length, ...vehicles.filter(vehicle => !retainedSources.has(vehicle.metadata.stockId)), ...reserved)
    }
    const unique = [...new Map(vehicles.map(vehicle => [vehicle.metadata.stockId, vehicle])).values()]
    const eligible = unique.filter(vehicle => kind === 'reserved' ? vehicle.websiteOnly === true && vehicle.reserved === true : kind === 'sold'
      ? (vehicle.lifecycleState ?? vehicle.metadata.lifecycleState) === 'SOLD'
      : isLiveListing(vehicle))
    caches.set(key, { vehicles: eligible, expires: Date.now() + CACHE_MS })
    return eligible
  })()
  pending.set(key, request)
  try { return await request } finally { pending.delete(key) }
}
