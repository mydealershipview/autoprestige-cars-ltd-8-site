"use client"

import HomeHeader from '@/components/home/HomeHeader'
import { ContactData } from '@/types/contact'
import { Make, Model } from '@/utilities/types'

interface NavigationProps {
  variant?: 'hero' | 'page'
  className?: string
  contactData?: ContactData | null
  isPromotionsEnabled?: boolean
  makes: Make[]
  models: Model[]
}

export default function Navigation(_props: NavigationProps) {
  return <HomeHeader />
}

