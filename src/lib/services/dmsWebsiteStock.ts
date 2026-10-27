import { reportOperationalError } from '@/utilities/reportOperationalError'
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
type FeedKind = Kind | 'inventory'
const MAX_PAGES = 100
let legacyAccessWarned = false
type Bundle = Record<Kind, WebsiteVehicle[]>
// One cache for all three lists, so a car can never be served from two lists of different ages.
const CACHE_MS = 30_000
const caches = new Map<string, { expires: number; bundle: Bundle }>()
const pending = new Map<string, Promise<Bundle>>()

/** All website stock comes from the public DMS allow-list. No provider/archive fallback: an
 * outage must never resurrect an unticked sold advert or turn into a believable empty showroom. */
export function websiteStockUrl(kind: FeedKind, page = 1, pageSize = 100): URL {
  // The private website key is preferred. Until it is configured the dealer-email access the DMS still accepts keeps the site working.
  const keyed = Boolean(process.env.DMS_WEBSITE_KEY)
  if (!process.env.DMS_URL || (!keyed && !process.env.DEALER_EMAIL) || (kind === 'reserved' && !process.env.DEALER_EMAIL)) throw new Error('Website stock configuration is missing')
  if (!keyed && !legacyAccessWarned) {
    legacyAccessWarned = true
    console.warn('[dealer-site] DMS_WEBSITE_KEY is not set: using dealer-email stock access. Set the key before the DMS requires it.')
  }
  const url = new URL(process.env.DMS_URL)
  url.searchParams.delete('dealerEmail')
  url.searchParams.delete('dealerId')
  // The reserved-ad archive still requires email in the current DMS API.
  if (kind === 'reserved' || !keyed) url.searchParams.set('dealerEmail', process.env.DEALER_EMAIL!)
  for (const key of ['status', 'includeReserved', 'lifecycleState']) url.searchParams.delete(key)
  if (kind === 'reserved') url.pathname = url.pathname.replace(/\/stock\/?$/, '/reserved-ads')
  if (kind !== 'inventory') url.searchParams.set(kind === 'sold' ? 'status' : 'includeReserved', kind === 'sold' ? 'sold' : 'true')
  url.searchParams.set('page', String(page))
  url.searchParams.set('pageSize', String(pageSize))
  return url
}

async function readPage(kind: FeedKind, page: number) {
  try {
  const response = await fetch(websiteStockUrl(kind, page), { headers: process.env.DMS_WEBSITE_KEY ? { Authorization: `Bearer ${process.env.DMS_WEBSITE_KEY}` } : {}, cache: 'no-store', signal: AbortSignal.timeout(15_000) })
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
  } catch (error) {
    await reportOperationalError('dms_stock_unavailable')
    throw error
  }
}

async function readAll(kind: FeedKind): Promise<WebsiteVehicle[]> {
  const first = await readPage(kind, 1)
  const vehicles = [...first.vehicles]
  for (let page = 2; page <= first.totalPages; page += 4) {
    const pages = await Promise.all(Array.from({ length: Math.min(4, first.totalPages - page + 1) },
      (_, offset) => readPage(kind, page + offset)))
    for (const result of pages) vehicles.push(...result.vehicles)
  }
  return [...new Map(vehicles.map(vehicle => [vehicle.metadata.stockId, vehicle])).values()]
}

/** Live, Reserved and sold lists are read and reconciled together and cached as one bundle for
 * 30 seconds. Separate per-list caches could show an old sold choice beside a new Reserved advert. */
export async function getDmsWebsiteVehicles(kind: Kind): Promise<WebsiteVehicle[]> {
  const key = websiteStockUrl('live').toString()
  const cached = caches.get(key)
  if (cached && cached.expires > Date.now()) return cached.bundle[kind]
  let request = pending.get(key)
  if (!request) {
    request = (async () => {
      const [liveRows, reservedRows, soldRows] = await Promise.all([readAll('live'), readAll('reserved'), readAll('sold')])
      const sold = soldRows.filter(vehicle => (vehicle.lifecycleState ?? vehicle.metadata.lifecycleState) === 'SOLD')
      const soldIds = new Set(sold.map(vehicle => vehicle.sourceStockId ?? vehicle.metadata.stockId))
      // Sold wins if upstream responses straddle a toggle change or an old edge cache.
      const reserved = reservedRows.filter(vehicle => vehicle.websiteOnly === true && vehicle.reserved === true &&
        !soldIds.has(vehicle.sourceStockId ?? vehicle.metadata.stockId))
      const retainedSources = new Set(reserved.map(vehicle => vehicle.sourceStockId ?? vehicle.metadata.stockId))
      const live = [...liveRows.filter(vehicle => isLiveListing(vehicle) &&
        !soldIds.has(vehicle.metadata.stockId) && !retainedSources.has(vehicle.metadata.stockId)), ...reserved]
      const bundle = { live, sold, reserved }
      // Only complete, valid reads are cached; failures throw above and are retried next request.
      caches.set(key, { bundle, expires: Date.now() + CACHE_MS })
      return bundle
    })()
    pending.set(key, request)
    const current = request
    const clear = () => { if (pending.get(key) === current) pending.delete(key) }
    void current.then(clear, clear)
  }
  return (await request)[kind]
}

// The unfiltered website feed also contains unselected SOLD stock. Its identities prevent
// an old Mongo snapshot from undoing a DMS toggle-off or duplicating re-advertised stock.
const inventoryCaches = new Map<string, { expires: number; rows: WebsiteVehicle[] }>()
const inventoryPending = new Map<string, Promise<WebsiteVehicle[]>>()
export async function getDmsWebsiteInventoryVehicles(): Promise<WebsiteVehicle[]> {
  const key = websiteStockUrl('inventory').toString()
  const cached = inventoryCaches.get(key)
  if (cached && cached.expires > Date.now()) return cached.rows
  const pendingRead = inventoryPending.get(key)
  if (pendingRead) return pendingRead
  const request = readAll('inventory').then(rows => {
    inventoryCaches.set(key, { rows, expires: Date.now() + CACHE_MS })
    return rows
  })
  inventoryPending.set(key, request)
  try { return await request } finally { inventoryPending.delete(key) }
}
