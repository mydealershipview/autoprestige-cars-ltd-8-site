import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/db/connect'
import VehicleOverrideModel from '../../../../lib/db/models/vehicleOverride.model'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ stockId: string }> },
) {
  try {
    const { stockId } = await params
    await connectDB()
    const override = await VehicleOverrideModel.findOne({ stockId }).lean()
    return NextResponse.json({ override: override ?? null })
  } catch (err) {
    console.error('vehicle-overrides GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch override' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ stockId: string }> },
) {
  try {
    const { stockId } = await params
    const body = await req.json()

    const { attentionGrabber, reservationStatus, listingPrice } = body as {
      attentionGrabber?: string | null
      reservationStatus?: string | null
      listingPrice?: number | null
    }

    const update: Record<string, unknown> = {}
    if (attentionGrabber !== undefined) update.attentionGrabber = attentionGrabber ?? null
    if (reservationStatus !== undefined) update.reservationStatus = reservationStatus ?? null
    if (listingPrice !== undefined) update.listingPrice = listingPrice ?? null

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No fields provided to update' }, { status: 400 })
    }

    await connectDB()
    const override = await VehicleOverrideModel.findOneAndUpdate(
      { stockId },
      { $set: update },
      { upsert: true, new: true, runValidators: true },
    ).lean()

    return NextResponse.json({ override })
  } catch (err) {
    console.error('vehicle-overrides PUT error:', err)
    return NextResponse.json({ error: 'Failed to save override' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ stockId: string }> },
) {
  try {
    const { stockId } = await params
    await connectDB()
    await VehicleOverrideModel.deleteOne({ stockId })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('vehicle-overrides DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete override' }, { status: 500 })
  }
}
