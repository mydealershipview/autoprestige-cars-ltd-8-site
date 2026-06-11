"use client"
import { Calculator, Search, X, Heart, Mail, MessageCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useWishlist } from '@/contexts/WishlistContext'
import ContactModal from "@/components/ui/contact-modal"
import Link from 'next/link'
import { ContactData } from '@/types/contact'
import { Make, Model } from '@/utilities/types'

type SideWidgetProps = {
  contactData: ContactData | null
  makes: Make[]
  models: Model[]
}

const SideWidget = ({ contactData, makes, models }: SideWidgetProps) => {
  // Budget filter modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [monthlyBudget, setMonthlyBudget] = useState(340)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isContactModalOpenExpanded, setIsContactModalOpenExpanded] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const { wishlistCount } = useWishlist()

  // Handle budget filter calculation (same logic as homepage)
  const handleBudgetFilter = (monthlyBudget: number) => {
    const monthlyRate = 0.099 / 12;
    const numPayments = 60;

    const factor = (Math.pow(1 + monthlyRate, numPayments) - 1) /
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments));

    const loanAmount = monthlyBudget * factor;
    const price = Math.ceil(loanAmount / 0.9);

    // Apply the calculated max price as a filter
    router.push(`/usedcars?maxPrice=${price.toString()}&sortBy=price`)
    console.log(pathname)
    // if (pathname.includes('/usedcars')) {
    //   window.location.reload()
    // }
    setShowBudgetModal(false)
  }

  const handleNavClick = (item: any) => {
    if (item.isModal) {
      setIsContactModalOpen(true)
    } else if (item.href.startsWith('#')) {
      const element = document.getElementById(item.href.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      router.push(item.href)
    }
  }

  // Handle WhatsApp click
  const handleWhatsAppClick = () => {
    const phoneNumber = contactData?.whatsappNumber?.replace(/\s/g, '') || "447123456789" // Static number for now
    const message = encodeURIComponent("Hello! I'm interested in your vehicles and would like more information.")
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  return (
    <></>
  )
}

export default SideWidget