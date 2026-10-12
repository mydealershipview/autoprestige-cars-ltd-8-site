import { NextResponse } from 'next/server'
import { getDmsWebsiteVehicles } from '@/lib/services/dmsWebsiteStock'
import { mergeVehiclesWithPayloadData } from '@/utilities/mergePayloadData'

export async function GET() {
  try {
    const vehicles = await getDmsWebsiteVehicles('live')
    const results = await mergeVehiclesWithPayloadData(vehicles.slice(0, 15))
    return NextResponse.json({ results, totalResults: vehicles.length, pageSize: 15, page: 1 }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Featured stock feed failed:', error)
    return NextResponse.json({ error: 'Failed to fetch featured vehicles' }, { status: 503 })
  }
}
