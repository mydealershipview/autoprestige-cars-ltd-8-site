import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { WebsiteVehicle } from '@/lib/services/dmsWebsiteStock'
import { formatPrice, generateVehicleSlug } from '@/utilities/formatVehicleData'
import { isReserved } from '@/utilities/websiteVehicleStatus'

/** Upgrade spec (Habib, 13/11/2026): 8 to 12 cars on the homepage, in the first HTML. The dealer picks
 * 8 to 12 in the DMS; FEATURED_COUNT is only for the fallback below. */
export const FEATURED_COUNT = 8
export const FEATURED_MAX = 12
/** Fewer cars than this: hide the section rather than show a thin row (spec). */
export const FEATURED_MIN = 4

const time = (v: WebsiteVehicle) => {
  const t = new Date(v.metadata?.dateOnForecourt || v.metadata?.lastUpdated || 0).getTime()
  return Number.isFinite(t) ? t : 0
}

/** A new arrival carries one "Coming soon" picture until it is photographed: not for the homepage. */
const hasPhotos = (v: WebsiteVehicle) => (v.media?.images?.length ?? 0) >= 2

/** The cars the dealer's DMS rule chose (Settings > Website, 25/11/2026), in that order, taken from
 * the live list so every card links to a car on the Used Cars page. A Reserved car shown from its
 * website copy matches by its original stock ID. Photographed cars only, like before.
 * featuredIds null = the featured feed is down: newest photographed cars, the same order as the
 * Used Cars page ("dateAdded"), so the homepage keeps its stock. */
export function pickFeatured(vehicles: WebsiteVehicle[], featuredIds: string[] | null = null): WebsiteVehicle[] {
  if (!featuredIds) return vehicles.filter(hasPhotos).sort((a, b) => time(b) - time(a)).slice(0, FEATURED_COUNT)
  const byId = new Map<string, WebsiteVehicle>()
  for (const vehicle of vehicles) {
    byId.set(String(vehicle.metadata.stockId), vehicle)
    if (vehicle.sourceStockId) byId.set(String(vehicle.sourceStockId), vehicle)
  }
  const picked = new Set<WebsiteVehicle>()
  for (const id of featuredIds) {
    const vehicle = byId.get(id)
    if (vehicle && hasPhotos(vehicle)) picked.add(vehicle)
  }
  return [...picked].slice(0, FEATURED_MAX)
}

/** Server-rendered, so search engines and AI crawlers see the stock without running scripts. */
export function FeaturedStock({ vehicles, featuredIds = null }: { vehicles: WebsiteVehicle[]; featuredIds?: string[] | null }) {
  const featured = pickFeatured(vehicles, featuredIds)
  if (featured.length < FEATURED_MIN) return null

  return (
    <section aria-labelledby="latest-stock" className="relative w-full bg-[#0d0d0d] border-t-4 border-blue-500">
      <div className="px-6 lg:px-12 pt-14 pb-16">
        <div className="mb-10">
          <div className="flex items-center mb-3">
            <div className="w-6 h-5 bg-blue-500 mr-4 shrink-0 -skew-x-24" />
            <h2 id="latest-stock" className="text-3xl lg:text-4xl font-black tracking-widest uppercase text-white leading-tight">
              LATEST STOCK
            </h2>
          </div>
          <p className="text-sm text-zinc-400 tracking-[0.18em] font-semibold uppercase ml-10">
            Hand-picked prestige and performance cars
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((vehicle) => {
            const make = vehicle.vehicle?.make || vehicle.vehicle?.standard?.make || ''
            const model = vehicle.vehicle?.model || vehicle.vehicle?.standard?.model || ''
            const derivative = vehicle.vehicle?.derivative || vehicle.vehicle?.standard?.derivative || ''
            const year = vehicle.vehicle?.yearOfManufacture
            const mileage = vehicle.vehicle?.odometerReadingMiles
            const fuel = vehicle.vehicle?.fuelType || vehicle.vehicle?.standard?.fuelType || ''
            const gearbox = vehicle.vehicle?.transmissionType || vehicle.vehicle?.standard?.transmissionType || ''
            // Same price as the Used Cars cards
            const price = vehicle.adverts?.forecourtPrice?.amountGBP ?? vehicle.adverts?.retailAdverts?.totalPrice?.amountGBP ?? null
            const image = vehicle.media?.images?.[0]?.href
            const reserved = isReserved(vehicle)
            const name = [year, make, model].filter(Boolean).join(' ')
            const href = `/usedcars/${generateVehicleSlug(vehicle)}`

            return (
              <li key={vehicle.metadata.stockId}>
                <Link href={href} className="block group h-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors">
                  {/* 4:3 like the stock photos (800x600), so the whole car shows on every screen
                      width. A fixed h-52 cut the bottom off on phones (25/11/2026). */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
                    {image ? (
                      <img
                        src={image}
                        alt={[name, derivative].filter(Boolean).join(' ')}
                        className="h-full w-full object-cover !transition-transform !duration-500 group-hover:scale-105"
                        width="800"
                        height="600"
                        loading="lazy"
                      />
                    ) : null}
                    {reserved && (
                      <span className="absolute top-2 left-2 rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold tracking-wide text-white">
                        Reserved
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-zinc-700">
                    <h3 className="text-sm font-black uppercase tracking-wide text-white truncate">{make} {model}</h3>
                    {derivative && <p className="text-xs text-zinc-400 truncate mt-0.5">{derivative}</p>}
                    <p className="flex flex-wrap gap-1.5 mt-2.5 text-[11px] text-zinc-400">
                      {[year, mileage ? `${new Intl.NumberFormat('en-GB').format(mileage)} miles` : '', fuel, gearbox]
                        .filter(Boolean)
                        .map((fact) => (
                          <span key={String(fact)} className="border border-zinc-600 px-2 py-0.5 font-semibold">{fact}</span>
                        ))}
                    </p>
                    {price ? <p className="mt-3 text-lg font-bold text-white">{formatPrice(price)}</p> : null}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-10 text-center">
          <Link
            href="/usedcars"
            className="inline-flex items-center gap-2 border border-blue-500 px-6 py-3 text-sm font-bold tracking-widest uppercase text-white hover:bg-blue-500 transition-colors"
          >
            View all {vehicles.length} cars <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
