import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import RegPlateModel from '@/lib/db/models/regPlate.model'
import {
  getRegPlates,
  normalizeRegPlateInput,
  type RegPlateInput,
} from '@/lib/services/regPlates.service'

function isStockAdmin(req: NextRequest) {
  return req.cookies.get('stock_admin_auth')?.value === 'authenticated'
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const includeInactive = searchParams.get('includeInactive') === 'true' && isStockAdmin(req)
    const plates = await getRegPlates({ includeInactive })

    return NextResponse.json({ plates })
  } catch (err) {
    console.error('reg-plates GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch reg plates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isStockAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as RegPlateInput
    const normalized = normalizeRegPlateInput(body)

    if (!normalized.plate) {
      return NextResponse.json({ error: 'Plate is required' }, { status: 400 })
    }

    await connectDB()
    const existing = await RegPlateModel.exists({ slug: normalized.slug })
    if (existing) {
      return NextResponse.json({ error: 'A reg plate with this slug already exists' }, { status: 409 })
    }

    await RegPlateModel.updateMany({}, { $inc: { displayOrder: 1 } })
    const plate = await RegPlateModel.create({ ...normalized, displayOrder: 0 })

    return NextResponse.json({ plate }, { status: 201 })
  } catch (err: unknown) {
    console.error('reg-plates POST error:', err)
    const message = err instanceof Error && 'code' in err && err.code === 11000
      ? 'A reg plate with this slug already exists'
      : 'Failed to create reg plate'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!isStockAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as { orderedIds?: string[] }
    const orderedIds = body.orderedIds?.filter(Boolean) ?? []

    if (orderedIds.length === 0) {
      return NextResponse.json({ error: 'No reg plate order provided' }, { status: 400 })
    }

    await connectDB()
    await RegPlateModel.bulkWrite(
      orderedIds.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { displayOrder: index } },
        },
      })),
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('reg-plates PATCH error:', err)
    return NextResponse.json({ error: 'Failed to save reg plate order' }, { status: 500 })
  }
}
