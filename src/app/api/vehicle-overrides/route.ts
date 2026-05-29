import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/db/connect'
import VehicleOverrideModel from '../../../lib/db/models/vehicleOverride.model'
/**
 * GET /api/vehicle-overrides?stockIds=id1,id2,...
 * Returns a map of stockId → override fields for the requested vehicle IDs.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const raw = searchParams.get('stockIds') || ''
    const stockIds = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (stockIds.length === 0) {
      return NextResponse.json({ overrides: {} })
    }

    await connectDB()
    const records = await VehicleOverrideModel.find(
      { stockId: { $in: stockIds } },
      { stockId: 1, attentionGrabber: 1, reservationStatus: 1, listingPrice: 1, _id: 0 },
    ).lean()

    const overrides: Record<string, { attentionGrabber?: string | null; reservationStatus?: string | null; listingPrice?: number | null }> = {}
    for (const r of records) {
      overrides[r.stockId] = { attentionGrabber: r.attentionGrabber, reservationStatus: r.reservationStatus, listingPrice: r.listingPrice }
    }

    return NextResponse.json({ overrides })
  } catch (err) {
    console.error('vehicle-overrides batch GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch overrides' }, { status: 500 })
  }
}
