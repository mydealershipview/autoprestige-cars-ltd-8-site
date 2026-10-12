import { NextRequest, NextResponse } from 'next/server'
import { fetchAutoTraderListings } from '../../../utilities/autotrader'
import { mergeVehiclesWithPayloadData } from '../../../utilities/mergePayloadData'

export async function GET(request: NextRequest) {
  // Try MyDealershipView API first
  try {
    console.log('Fetching featured vehicles from MyDealershipView API...')
    const myDealershipUrl = `${process.env.DMS_URL}?dealerEmail=${process.env.DEALER_EMAIL}&pageSize=15&page=1`
    
    const response = await fetch(myDealershipUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`MyDealershipView API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Ensure results is always an array - handle nested structure
    let results = data.data?.vehicles || data.results || data.vehicles || []
    if (!Array.isArray(results)) {
      results = []
    }
    
    console.log(`Retrieved ${results.length} featured vehicles from MyDealershipView API`)
    
    // Merge vehicles with Payload data efficiently if needed
    const mergedVehicles = results.length > 0 ? await mergeVehiclesWithPayloadData(results) : []
    
    return NextResponse.json({
      results: mergedVehicles,
      totalResults: data.totalResults || data.total || results.length,
      pageSize: 15,
      page: 1
    })
  } catch (error) {
    console.error('MyDealershipView API error:', error)
    
    // Fallback to AutoTrader API
    try {
      console.log('Falling back to AutoTrader API for featured vehicles')
      // Fetch top 15 vehicles for homepage featured section
      const listings = await fetchAutoTraderListings({
        page: 1,
        pageSize: 15,
      })

      // Ensure results is an array
      const listingsResults = Array.isArray(listings.results) ? listings.results : []

      // Merge vehicles with Payload data efficiently
      const mergedVehicles = listingsResults.length > 0 ? await mergeVehiclesWithPayloadData(listingsResults) : []

      // Return the response with merged vehicle data
      const response = {
        ...listings,
        results: mergedVehicles
      }

      console.log(`Fallback: Retrieved ${listingsResults.length} featured vehicles from AutoTrader API`)
      return NextResponse.json(response)
    } catch (error) {
      console.error('AutoTrader fallback also failed for featured vehicles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch featured vehicles' },
        { status: 500 }
      )
    }
  }
}
