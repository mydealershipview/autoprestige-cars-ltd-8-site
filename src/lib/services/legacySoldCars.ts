import { soldImageURL } from '@/utilities/soldImageURL'
import connectDB from '@/lib/db/connect'
import SoldCarModel from '@/lib/db/models/soldCar.model'
import type { WebsiteVehicle } from './dmsWebsiteStock'

/** Read the frozen legacy archive only. Never resync or write DMS stock into MongoDB. */
export async function readLegacySoldCars(): Promise<WebsiteVehicle[]> {
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
