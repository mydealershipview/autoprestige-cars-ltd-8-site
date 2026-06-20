import { NextRequest, NextResponse } from 'next/server'
import {
  getSoldCarsForAdmin,
  syncSoldCarsFromDMS,
  updateSoldCarsShowAfter30Days,
} from '@/lib/services/soldCars.service'

function isStockAdmin(req: NextRequest) {
  return req.cookies.get('stock_admin_auth')?.value === 'authenticated'
}

export async function GET(req: NextRequest) {
  if (!isStockAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const shouldSync = searchParams.get('sync') !== 'false'
    const sync = shouldSync ? await syncSoldCarsFromDMS() : null
    const cars = await getSoldCarsForAdmin()

    return NextResponse.json({ cars, totalResults: cars.length, sync })
  } catch (err) {
    console.error('sold-cars GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch sold cars' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!isStockAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as { ids?: string[]; showAfter30Days?: boolean }
    const ids = body.ids?.filter(Boolean) ?? []

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No sold cars selected' }, { status: 400 })
    }

    if (typeof body.showAfter30Days !== 'boolean') {
      return NextResponse.json({ error: 'showAfter30Days must be true or false' }, { status: 400 })
    }

    const modifiedCount = await updateSoldCarsShowAfter30Days(ids, body.showAfter30Days)
    return NextResponse.json({ success: true, modifiedCount })
  } catch (err) {
    console.error('sold-cars PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update sold cars' }, { status: 500 })
  }
}
