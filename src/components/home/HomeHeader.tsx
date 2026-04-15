"use client"

import { useState } from "react"
import { Facebook, Instagram, Menu, MessageCircle, Phone, X, Youtube } from "lucide-react"
import Link from "next/link"
import type { ContactData } from "@/types/contact"

const navItems = [
  { label: "HOME", href: "/" },
  { label: "SHOWROOM", href: "/used-cars" },
  { label: "SERVICES", href: "/services" },
  { label: "REG PLATES", href: "/reg-plates" },
  { label: "VALUATION", href: "/valuation" },
  { label: "FINANCE", href: "/finance" },
  { label: "PROFILE", href: "/profile" },
  { label: "WARRANTY", href: "/warranty" },
  { label: "REVIEWS", href: "/reviews" },
  { label: "CONTACT US", href: "/contact" },
]

type HomeHeaderProps = {
  contactData?: ContactData | null
  dealershipName?: string
  dealershipTagline?: string
  logoUrl?: string
}

const sanitizePhoneForTel = (value?: string | null) =>
  (value || '').replace(/\s+/g, '')

const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'whatsapp':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )
      case 'facebook':
        return (
          <Facebook className="h-5 w-5 text-white" />
        )
      case 'instagram':
        return (
          <Instagram className="h-5 w-5 text-white" />
        )
      case 'twitter':
      case 'x':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        )
      case 'youtube':
        return (
          <Youtube className="h-5 w-5 text-white" />
        )
      case 'tiktok':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.82a8.18 8.18 0 0 0 4.78 1.52V6.89a4.85 4.85 0 0 1-1.01-.2z" />
          </svg>
        )
      case 'linkedin':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        )
      default:
        return <MessageCircle className="h-5 w-5 text-white" />
    }
  }

export default function HomeHeader({
  contactData,
  dealershipName,
  dealershipTagline,
  logoUrl,
}: HomeHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const requiredSidebarItems = [
    { label: 'REG PLATES', href: '/reg-plates', insertIndex: 3 },
    { label: 'VALUATION', href: '/valuation', insertIndex: 4 },
    { label: 'FINANCE', href: '/finance', insertIndex: 5 },
    { label: 'PROFILE', href: '/profile', insertIndex: 6 },
  ]

  const sidebarNavItems = requiredSidebarItems.reduce((items, requiredItem) => {
    if (items.some((item) => item.href === requiredItem.href)) {
      return items
    }

    const next = [...items]
    next.splice(Math.min(requiredItem.insertIndex, next.length), 0, {
      label: requiredItem.label,
      href: requiredItem.href,
    })

    return next
  }, navItems)

  const displayName = dealershipName?.trim() || 'Dealership'
  const displayTagline = dealershipTagline?.trim() || 'Trusted used vehicles and service'

  const phoneNumbers = contactData?.phoneNumbers || []
  const primaryPhone = phoneNumbers.find((phone) => phone.isPrimary)?.number || phoneNumbers[0]?.number || ''
  const primaryEmail =
    contactData?.emailAddresses?.find((entry) => entry.isPrimary)?.email ||
    contactData?.emailAddresses?.[0]?.email ||
    ''

  const socialLinks = (contactData?.socialLinks || []).filter((link) => link.isActive !== false)

  const whatsappNumber = contactData?.whatsappNumber
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\s+/g, '')}`
    : `https://wa.me/${phoneNumbers[0]?.number.replace(/\s+/g, '')}`

  return (
    <>
      {/* Header */}
      {/* <header className="absolute inset-x-0 top-0 z-20 flex h-20 items-center justify-between px-6 lg:px-12 border-b border-white/10 bg-black/30 backdrop-blur-sm text-white"> */}
      <header className="absolute inset-x-0 top-0 z-20 flex h-20 items-center justify-between px-6 lg:px-12 border-b border-white/10 bg-[#1F2328] text-white">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-2 hover:text-blue-400 !transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6 text-blue-400" />
            <span className="hidden sm:inline font-semibold tracking-wider">MENU</span>
          </button>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
          <Link href="/" className="flex items-center hover:opacity-80 !transition-opacity">
            {logoUrl ? (
              <img src={logoUrl} alt={displayName} className="h-10 md:h-15 w-auto max-w-[250px] md:max-w-none object-contain" />
            ) : (
              <>
                <div className="w-8 h-6 xl:w-10 xl:h-8 bg-blue-500 mr-2 -skew-x-[24deg]"></div>
                <span className="text-2xl xl:text-3xl font-black tracking-widest uppercase">{displayName}</span>
              </>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <a href={primaryPhone ? `tel:${sanitizePhoneForTel(primaryPhone)}` : '#'} className="hidden lg:flex items-center gap-2 hover:text-blue-400 !transition-colors">
            <Phone className="h-4 w-4 text-blue-400" />
            <span className="font-semibold tracking-wider">{primaryPhone || 'Call us'}</span>
          </a>
          {socialLinks.length > 0 && (
            <div className="hidden sm:flex items-center">
              <div className="flex items-center gap-2 sm:gap-4 ml-6">
                <div className="h-10 w-[1px] bg-white/20"></div>
                
                  <a
                    key="whatsapp"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="whatsapp"
                    className="hover:text-blue-400 !transition-colors flex items-center justify-center p-1"
                  >
                    {getSocialIcon('whatsapp')}
                  </a>
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.platform.toLowerCase() === 'whatsapp' ? whatsappUrl : link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="hover:text-blue-400 !transition-colors flex items-center justify-center p-1"
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
                <div className="h-10 w-[1px] bg-white/20"></div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Overlay */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-30 bg-black/60 !transition-opacity !duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-in Navigation Sidebar */}
      <nav
        className={`fixed top-0 left-0 z-40 h-full w-full sm:w-[420px] bg-black flex flex-col transform !transition-transform !duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-10 pt-10 pb-6 border-b border-white/10">
          <span className="text-white text-xl font-black tracking-[0.3em] uppercase">NAVIGATE</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-white hover:text-blue-400 !transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Nav Links */}
        <ul className="flex flex-col px-10 py-8 gap-1 flex-1">
          {sidebarNavItems.map((item, i) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block py-3 text-sm font-semibold tracking-[0.25em] uppercase !transition-colors hover:text-blue-400 ${
                  i === 0 ? "text-white border-b border-white/30 pb-3" : "text-white/80"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Bottom Contact Info */}
        <div className="border-t border-white/10 px-10 py-8 flex flex-col gap-4">
          <a
            href={primaryPhone ? `tel:${sanitizePhoneForTel(primaryPhone)}` : '#'}
            className="flex items-center gap-4 text-white hover:text-blue-400 !transition-colors group"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full border border-blue-500 group-hover:bg-blue-500 !transition-colors shrink-0">
              <Phone className="h-4 w-4 text-blue-400 group-hover:text-white !transition-colors" />
            </span>
            <span className="font-semibold tracking-widest text-sm">{primaryPhone || 'Call us'}</span>
          </a>
          <a
            href={primaryEmail ? `mailto:${primaryEmail}` : '#'}
            className="flex items-center gap-4 text-white hover:text-blue-400 !transition-colors group"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full border border-blue-500 group-hover:bg-blue-500 !transition-colors shrink-0">
              <svg className="h-4 w-4 text-blue-400 group-hover:text-white !transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <span className="font-semibold tracking-widest text-sm uppercase">{primaryEmail || displayTagline}</span>
          </a>
        </div>
      </nav>
    </>
  )
}
