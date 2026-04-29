"use client"

import { Phone, MapPin, Clock, MessageCircle, Facebook, Instagram, Youtube } from "lucide-react"
import { ContactData } from "@/types/contact"
import { Make, Model } from "@/utilities/types"
import Link from "next/link"
import type { OpeningHours } from "@/types/dealership"

interface FooterProps {
  contactData?: ContactData | null
  dealershipName?: string
  openingHours?: OpeningHours
  makes: Make[]
  models: Model[]
}

export default function Footer({ contactData, dealershipName, openingHours }: FooterProps) {
  const primaryPhone = contactData?.phoneNumbers?.find(p => p.isPrimary) ?? contactData?.phoneNumbers?.[0]
  const primaryEmail = contactData?.emailAddresses?.find(e => e.isPrimary) ?? contactData?.emailAddresses?.[0]
  const address = contactData?.businessAddress
  const displayName = dealershipName || address?.name || 'Dealership'

  const phone = primaryPhone?.number ?? 'Phone available on request'
  const email = primaryEmail?.email ?? 'Email available on request'
  const phoneHref = primaryPhone?.number ? `tel:${primaryPhone.number.replace(/\s/g, '')}` : '#'
  const emailHref = primaryEmail?.email ? `mailto:${primaryEmail.email}` : '#'
  const addressLine = address
    ? [address.name, address.street, address.city && address.postcode ? `${address.city}, ${address.postcode}` : address.city ?? address.postcode].filter(Boolean).join(', ')
    : 'Address details available on request'

  const socialLinks = (contactData?.socialLinks ?? []).filter(s => s.isActive !== false)

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

  return (
    <footer className="w-full bg-black text-gray-400 py-16 px-6 lg:px-12 border-t border-blue-500/50 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col items-center">

        {/* Main Info Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full mb-16 px-4 lg:px-0">
          {/* Contact Details */}
          <div className="flex flex-col gap-6 items-center md:items-start md:border-r border-white/10 md:pr-12">
            <a href={phoneHref} className="flex items-center gap-4 w-full justify-center md:justify-start group">
              <div className="flex items-center justify-center w-10 h-10 border border-white/20 group-hover:border-blue-500 !transition-colors shrink-0">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <div className="text-white font-semibold tracking-wider text-xl">{phone}</div>
            </a>
            <a href={emailHref} className="flex items-center gap-4 w-full justify-center md:justify-start group">
              <div className="flex items-center justify-center w-10 h-10 border border-white/20 group-hover:border-blue-500 !transition-colors shrink-0">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-white font-medium tracking-wide">{email}</div>
            </a>
          </div>

          {/* Address & Hours */}
          <div className="flex flex-col gap-6 items-center md:items-start md:border-r border-white/10 md:pr-12">
            <div className="flex items-start gap-4 w-full justify-center md:justify-start">
              <div className="flex items-center justify-center w-10 h-10 border border-white/20 hover:border-blue-500 !transition-colors mt-1 shrink-0">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <address className="not-italic text-white/80 text-sm leading-relaxed tracking-wide">
                {addressLine}
              </address>
            </div>
            <div className="flex items-start gap-4 w-full justify-center md:justify-start">
              <div className="flex items-center justify-center w-10 h-10 border border-white/20 hover:border-blue-500 !transition-colors mt-1 shrink-0">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div className="text-white/80 text-xs leading-relaxed tracking-wider space-y-1">
                <div>{openingHours?.weekdays || 'Monday - Friday: 9:00 am - 6:00 pm'}</div>
                <div>{openingHours?.saturday || 'Saturday: 9:00 am - 5:00 pm'}</div>
                <div>{openingHours?.sunday || 'Sunday: By Appointment'}</div>
              </div>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
            {socialLinks.length > 0 ? (
              socialLinks.map(s => (
                <a
                  key={s.id ?? s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="flex items-center justify-center w-12 h-12 border border-white/20 hover:border-blue-500 hover:text-blue-400 !transition-colors"
                >
                  {getSocialIcon(s.platform)}
                </a>
              ))
            ) : (
              <>
                <a href="#" className="flex items-center justify-center w-12 h-12 border border-white/20 hover:border-blue-500 hover:text-blue-400 !transition-colors">
                  <MessageCircle className="h-5 w-5 text-white" />
                </a>
                <a href="#" className="flex items-center justify-center w-12 h-12 border border-white/20 hover:border-blue-500 hover:text-blue-400 !transition-colors">
                  <Facebook className="h-5 w-5 text-white" />
                </a>
                <a href="#" className="flex items-center justify-center w-12 h-12 border border-white/20 hover:border-blue-500 hover:text-blue-400 !transition-colors">
                  <Instagram className="h-5 w-5 text-white" />
                </a>
              </>
            )}
          </div>
        </div>

        <div className="w-full h-px bg-white/10 mb-12" />

        {/* Primary Disclaimer */}
        <div className="text-[10px] md:text-xs text-center text-gray-500 max-w-6xl mx-auto leading-relaxed mb-12 uppercase tracking-wide">
            <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed tracking-wide">
              <p>
                <span className="text-white font-semibold uppercase tracking-widest text-[11px] block mb-2">Important Disclosure</span>
                Whilst every care has been taken to ensure all of the information on this site is accurate, please always check with your dealer as errors can occur.
              </p>
              <p>
                We act as a credit broker not a lender. We work with a number of carefully selected credit providers who typically will be able to offer you finance for your purchase. (Written quotations available on request). Whichever lender we introduce you to, we will typically receive a fee from them (either a fixed fee or a percentage of the amount you borrow). The lenders we work with could pay commissions at different rates. All finance is subject to status and income. Terms and conditions apply. Applicants must be 18 years or over.
              </p>
              <p className="text-white/60 text-xs tracking-widest uppercase border-t border-white/10 pt-4">
                Autoprestige is the trading name of <span className="text-white/80">Cars Unlimited Ltd</span>
              </p>
            </div>
        </div>

        {/* FCA Regulatory Note */}
        <div className="text-[10px] text-center text-gray-600 max-w-6xl mx-auto leading-relaxed mb-12 uppercase tracking-wide">
          <p>
            Authorised &amp; regulated by the Financial Conduct Authority for Consumer Credit. Finance subject to status — UK residents 18+ only. Guarantees may be required.
          </p>
        </div>

        {/* Bottom Legal Links */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-[10px] md:text-xs text-gray-500 tracking-wider">
          <span>© {new Date().getFullYear()} {displayName}</span>
          <span className="hidden md:inline">|</span>
          <Link href="/terms" className="hover:text-blue-400 !transition-colors uppercase border-b border-blue-700 pb-0.5">Terms &amp; Conditions</Link>
          <span className="hidden md:inline">|</span>
          <Link href="/privacy" className="hover:text-blue-400 !transition-colors uppercase border-b border-blue-700 pb-0.5">Privacy Policy</Link>
          <span className="hidden md:inline">|</span>
          <Link href="/cookies" className="hover:text-blue-400 !transition-colors uppercase border-b border-blue-700 pb-0.5">Cookie Preferences</Link>
          <span className="hidden md:inline">|</span>
          <Link href="/contact" className="hover:text-blue-400 !transition-colors uppercase border-b border-blue-700 pb-0.5">Contact Us</Link>
        </div>

        {/* Powered By */}
        <div className="mt-8 text-center text-[10px] md:text-xs text-gray-600 tracking-wider">
          Website powered by <a href="https://mydealershipview.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 !transition-colors border-b border-blue-700 pb-0.5">MYDEALERSHIPVIEW</a>
        </div>
      </div>
    </footer>
  )
}
