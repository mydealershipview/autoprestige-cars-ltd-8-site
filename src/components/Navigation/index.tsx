"use client"

import HomeHeader from '@/components/home/HomeHeader'
import { ContactData } from '@/types/contact'
import { Make, Model } from '@/utilities/types'

interface NavigationProps {
  variant?: 'hero' | 'page'
  className?: string
  contactData?: ContactData | null
  dealershipName?: string
  dealershipTagline?: string
  logoUrl?: string
  isPromotionsEnabled?: boolean
  makes: Make[]
  models: Model[]
}

export default function Navigation(props: NavigationProps) {
  return (
    <HomeHeader
      contactData={props.contactData}
      dealershipName={props.dealershipName}
      dealershipTagline={props.dealershipTagline}
      logoUrl={props.logoUrl}
    />
  )
}

