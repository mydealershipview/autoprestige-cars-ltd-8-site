import { getDmsWebsiteVehicles } from '@/lib/services/dmsWebsiteStock'
import { extractMakesAndModelsFromVehicles } from '@/utilities/make-model'
import React from 'react'
import Navigation from './Navigation'
import Footer from './Footer'
import { getDealershipInfo } from '@/lib/services/dealership.service'
import { mapDealershipInfoToContactData } from '@/utilities/dealershipInfo'

type Props = {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  const fetchAvailableMakesAndModels = async () => {
    try {
      return extractMakesAndModelsFromVehicles(await getDmsWebsiteVehicles('live'))
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
    </>
  )
}

export default Layout
