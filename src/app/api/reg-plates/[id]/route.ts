import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import RegPlateModel from '@/lib/db/models/regPlate.model'
import { normalizeRegPlateInput, type RegPlateInput } from '@/lib/services/regPlates.service'

function isStockAdmin(req: NextRequest) {
  return req.cookies.get('stock_admin_auth')?.value === 'authenticated'
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isStockAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = (await req.json()) as RegPlateInput
    const normalized = normalizeRegPlateInput(body)

    if (!normalized.plate) {
      return NextResponse.json({ error: 'Plate is required' }, { status: 400 })
    }

    await connectDB()
    const plate = await RegPlateModel.findByIdAndUpdate(
      id,
      { $set: normalized },
      { new: true, runValidators: true },
    ).lean()

    if (!plate) {
      return NextResponse.json({ error: 'Reg plate not found' }, { status: 404 })
    }

    return NextResponse.json({ plate })
  } catch (err: unknown) {
    console.error('reg-plates PUT error:', err)
    const message = err instanceof Error && 'code' in err && err.code === 11000
      ? 'A reg plate with this slug already exists'
      : 'Failed to update reg plate'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isStockAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await connectDB()
    const deleted = await RegPlateModel.findByIdAndDelete(id).lean()
    if (deleted && typeof deleted.displayOrder === 'number') {
      await RegPlateModel.updateMany(
        { displayOrder: { $gt: deleted.displayOrder } },
        { $inc: { displayOrder: -1 } },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('reg-plates DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete reg plate' }, { status: 500 })
  }
}
