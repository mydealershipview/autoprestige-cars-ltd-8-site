import { stockCacheHeaders, noStoreHeaders } from '@/utilities/stockCacheHeaders'
import { NextRequest, NextResponse } from 'next/server'
import { getVehicleDetails } from '@/lib/services/vehicleDetails'
export async function GET(_request: NextRequest, { params }: { params: Promise<{ stockId: string }> }) {
  try {
    const { stockId } = await params
    const data = await getVehicleDetails(stockId)
    return data ? NextResponse.json(data, { headers: stockCacheHeaders }) : NextResponse.json({ error: 'Vehicle not found' }, { status: 404, headers: noStoreHeaders })
  } catch {
    console.error('Vehicle detail stock feed unavailable')
    return NextResponse.json({ error: 'Unable to load vehicle details' }, { status: 503, headers: noStoreHeaders })
  }
}
