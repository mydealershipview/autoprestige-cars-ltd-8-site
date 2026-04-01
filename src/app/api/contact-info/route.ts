import { NextResponse } from 'next/server'
import { getDealershipInfo } from '@/lib/services/dealership.service'
import { mapDealershipInfoToContactData } from '@/utilities/dealershipInfo'

export async function GET() {
  try {
    const dealership = await getDealershipInfo()
    const contactData = mapDealershipInfoToContactData(dealership)

    return NextResponse.json(contactData)
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json(null, { status: 500 })
  }
}
