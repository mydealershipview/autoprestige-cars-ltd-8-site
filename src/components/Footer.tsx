"use client"

import { Phone, MapPin, Clock, MessageCircle, Facebook, Instagram, Youtube, Send } from "lucide-react"
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
  return (
    <footer className="w-full bg-[#0a0a0a] text-zinc-400 py-16 px-6 lg:px-12 border-t border-white/5 relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full mb-12">
          {/* Logo and Description */}
          <div className="flex flex-col items-start gap-4">
            <Link href="/" className="inline-block">
              <img
                src="/logo2.png"
                alt="Motor Time Group"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400 max-w-sm mt-2">
              Family-run car dealership based in Long Eaton, Nottingham. Hand-picked quality used cars, prepared to retail-ready standard.
            </p>
            <div className="flex items-center gap-2 mt-4 text-[#c8e63c] font-black tracking-wider text-xs uppercase">
              <span>No Admin Fees</span>
              <span className="text-zinc-700">|</span>
              <span>Part Exchange</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-start">
            <h3 className="text-white font-extrabold uppercase text-sm tracking-wider mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/usedcars" className="hover:text-white transition-colors">
                  Our Stock
                </Link>
              </li>
              <li>
                <Link href="/contents/profile" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/finance" className="hover:text-white transition-colors">
                  Finance
                </Link>
              </li>
              <li>
                <Link href="/valuation" className="hover:text-white transition-colors">
                  Part Exchange
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Warranty Wise
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://www.autotrader.co.uk/dealer/back-to-results?advertiserid=10028737"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  AutoTrader Listing
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col items-start text-sm">
            <h3 className="text-white font-extrabold uppercase text-sm tracking-wider mb-6">Contact</h3>
            <div className="space-y-3 text-zinc-400">
              <p>
                <a href="tel:07441940552" className="hover:text-white transition-colors">
                  07441 940552
                </a>
              </p>
              <p>8A-8E Huss's Lane</p>
              <p>Long Eaton, NG10 1GS</p>
              <p>Open 7 days: 10:00 - 17:00</p>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-white/10 my-8" />

        {/* Legal Disclaimers */}
        <div className="space-y-4 text-xs text-zinc-500 leading-relaxed uppercase tracking-wide">
          <p>© 2026 Motor Time Group Ltd. Company No. 14925459. Registered in England & Wales.</p>
          <p className="text-zinc-600">
            Motor Time Group Ltd is not FCA authorised or regulated. Finance is arranged through third-party FCA-authorised partners. We do not provide financial advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
