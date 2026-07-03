import React from 'react'
import { headers } from 'next/headers'
import Navigation from './Navigation'
import Footer from './Footer'
import SideWidget from './SideWidget'
import { getDealershipInfo } from '@/lib/services/dealership.service'
import { mapDealershipInfoToContactData } from '@/utilities/dealershipInfo'

type Props = {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  const fetchAvailableMakesAndModels = async () => {
    try {
      const requestHeaders = await headers()
      const host = requestHeaders.get('host')
      const protocol = requestHeaders.get('x-forwarded-proto') || 'http'
      const baseUrl = host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_SERVER_URL
      const response = await fetch(`${baseUrl}/api/available-makes-models`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      console.error('Failed to fetch available makes and models:', err)
      return { makes: [], models: [] }
    }
  }

  const dealership = await getDealershipInfo()
  const contactData = mapDealershipInfoToContactData(dealership)
  const { makes, models } = await fetchAvailableMakesAndModels()

  return (
    <>
      <Navigation
        contactData={contactData}
        dealershipName={dealership.name}
        dealershipTagline={dealership.tagline}
        logoUrl={dealership.logoUrl}
        isPromotionsEnabled
        makes={makes || []}
        models={models || []}
      />
      {children}
      <Footer
        contactData={contactData}
        dealershipName={dealership.name}
        openingHours={dealership.openingHours}
        makes={makes}
        models={models}
      />
      <SideWidget contactData={contactData} makes={makes} models={models} />
    </>
  )
}

export default Layout
