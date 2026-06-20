import { NextRequest, NextResponse } from 'next/server'
import { updateSoldCarShowAfter30Days } from '@/lib/services/soldCars.service'

function isStockAdmin(req: NextRequest) {
  return req.cookies.get('stock_admin_auth')?.value === 'authenticated'
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isStockAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = (await req.json()) as { showAfter30Days?: boolean }

    if (typeof body.showAfter30Days !== 'boolean') {
      return NextResponse.json({ error: 'showAfter30Days must be true or false' }, { status: 400 })
    }

    const car = await updateSoldCarShowAfter30Days(id, body.showAfter30Days)
    if (!car) {
      return NextResponse.json({ error: 'Sold car not found' }, { status: 404 })
    }

    return NextResponse.json({ car })
  } catch (err) {
    console.error('sold-cars PATCH detail error:', err)
    return NextResponse.json({ error: 'Failed to update sold car' }, { status: 500 })
  }
}
