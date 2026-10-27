import { stockCacheHeaders, noStoreHeaders } from '@/utilities/stockCacheHeaders'
import { NextResponse } from 'next/server'
import { getDmsWebsiteVehicles } from '@/lib/services/dmsWebsiteStock'
import { extractMakesAndModelsFromVehicles } from '@/utilities/make-model'
export async function GET() {
  try {
    return NextResponse.json(extractMakesAndModelsFromVehicles(await getDmsWebsiteVehicles('live')), { headers: stockCacheHeaders })
  } catch {
    console.error('Available makes and models stock feed unavailable')
    return NextResponse.json({ error: 'Unable to load makes and models' }, { status: 503, headers: noStoreHeaders })
  }
}
