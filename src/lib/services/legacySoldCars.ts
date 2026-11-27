import { soldImageURL } from '@/utilities/soldImageURL'
import connectDB from '@/lib/db/connect'
import SoldCarModel from '@/lib/db/models/soldCar.model'
import type { WebsiteVehicle } from './dmsWebsiteStock'

/**
 * The frozen legacy archive (no writes since the old sold-cars admin was retired), kept in memory.
 * Reading it took ~14 s on every sold request (sold carousel, Sold Cars page, every sold car page,
 * 27/11/2026). Now it is read once, then re-read in the background at most once an hour; visitors
 * get the copy in memory meanwhile. The first read still fails loudly (no empty showroom), and a
 * failed background re-read keeps the last good copy.
 */
const ARCHIVE_REFRESH_MS = 60 * 60 * 1000
let archive: { fetchedAt: number; rows: WebsiteVehicle[] } | null = null
let pending: Promise<WebsiteVehicle[]> | null = null

async function loadLegacySoldCars(): Promise<WebsiteVehicle[]> {
  await connectDB()
  const rows = await SoldCarModel.find({ showOnSoldPage: true }).select({ stockId: 1, vehicle: 1, soldDate: 1 }).lean().exec()
  return rows.map(row => {
    const car = row.vehicle
    if (!car?.vehicle || !car.adverts || !row.stockId) throw new Error('Invalid legacy sold vehicle')
    return {
      ...car,
      lifecycleState: 'SOLD',
      metadata: { ...car.metadata, stockId: row.stockId, lifecycleState: 'SOLD' },
      soldAt: new Date(row.soldDate).toISOString(),
      media: { ...car.media, images: (car.media?.images ?? []).map(image => ({
        ...image, href: soldImageURL(image.href),
      })) },
    }
  })
}

function refreshArchive(): Promise<WebsiteVehicle[]> {
  if (!pending) {
    const request = loadLegacySoldCars().then(rows => {
      archive = { rows, fetchedAt: Date.now() }
      return rows
    })
    pending = request
    const clear = () => { if (pending === request) pending = null }
    void request.then(clear, clear)
  }
  return pending
}

/** Read the frozen legacy archive only. Never resync or write DMS stock into MongoDB. */
export async function readLegacySoldCars(): Promise<WebsiteVehicle[]> {
  if (!archive) return refreshArchive()
  if (Date.now() - archive.fetchedAt >= ARCHIVE_REFRESH_MS) {
    refreshArchive().catch(error => console.error('Legacy sold archive re-read failed; serving the last good copy', error))
  }
  return archive.rows
}

/** Tests only: forget the copy in memory */
export function clearLegacySoldCarsCache() {
  archive = null
  pending = null
}
