'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, MessageCircle, Phone } from 'lucide-react'

/**
 * Upgrade spec (Habib, 13/11/2026): on phones a sticky Call / WhatsApp / Enquire bar, so a buyer can
 * contact the dealer in one tap from any page. Phones and tablets only (hidden from lg up); not on the
 * dealer's stock admin. A spacer the same height keeps the footer from being covered. Layer 35: above
 * the menu's dimmed backdrop (30), below the open menu (40) and the cookie banner (100).
 */
export function MobileContactBar({ phone, whatsapp }: { phone?: string; whatsapp?: string }) {
  const pathname = usePathname() || ''
  if (pathname.startsWith('/stock-admin')) return null

  const tel = (phone || '').replace(/[^\d+]/g, '')
  const wa = (whatsapp || phone || '').replace(/\D/g, '').replace(/^0/, '44')
  const item = 'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white'

  return (
    <>
      <div aria-hidden="true" className="h-16 bg-black lg:hidden" />
      <nav
        aria-label="Contact us"
        className="fixed inset-x-0 bottom-0 z-[35] flex border-t border-white/15 bg-black/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {tel && (
          <a href={`tel:${tel}`} className={item}>
            <Phone className="h-5 w-5 text-blue-400" aria-hidden="true" />
            Call
          </a>
        )}
        {wa && (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={`${item} border-l border-white/15`}>
            <MessageCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
            WhatsApp
          </a>
        )}
        <Link href="/contact#contact-form" className={`${item} border-l border-white/15 bg-blue-600`}>
          <Mail className="h-5 w-5" aria-hidden="true" />
          Enquire
        </Link>
      </nav>
    </>
  )
}
