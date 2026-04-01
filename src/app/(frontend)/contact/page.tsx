import React from 'react'
import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Globe } from 'lucide-react'
import ContactForm from './_components/ContactForm'
import { getDealershipInfo } from '@/lib/services/dealership.service'
import { mapDealershipInfoToContactData } from '@/utilities/dealershipInfo'

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Contact Us | ${dealership.name}`,
    description:
      dealership.seoText ||
      `Get in touch with ${dealership.name}. Find our contact details, opening hours, and send us a message.`,
    openGraph: {
      title: `Contact Us | ${dealership.name}`,
      description: `Get in touch with ${dealership.name} by phone, email, or in person.`,
      type: 'website',
      locale: 'en_GB',
    },
  }
}

const platformIcon = (platform: string) => {
  switch (platform) {
    case 'facebook':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      )
    case 'snapchat':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11.69 2.5a5.1 5.1 0 0 0-5.02 5.25c0 .35.04.7.1 1-1.39.36-2.62 1.34-2.62 2.76 0 .42.19.78.52 1.05.33.26.81.45 1.38.52 0 .91-1.48 1.46-2.31 1.76-.19.07-.24.3-.1.43.08.07.18.11.29.11.9 0 2.27-.36 3.63 0 1.02.27 1.5 1.53 1.84 2a2.33 2.33 0 0 0 4.6 0c.34-.47.82-1.73 1.84-2 1.36-.36 2.73 0 3.63 0 .1 0 .21-.04.29-.11.14-.13.09-.36-.1-.43-.83-.3-2.31-.85-2.31-1.76.57-.07 1.05-.26 1.38-.52.33-.27.52-.63.52-1.05 0-1.42-1.23-2.4-2.62-2.76.06-.3.1-.65.1-1a5.1 5.1 0 0 0-5.02-5.25z" />
        </svg>
      )
    default:
      return <Globe size={18} />
  }
}

export default async function ContactPage() {
  const dealership = await getDealershipInfo()
  const contactData = mapDealershipInfoToContactData(dealership)

  const openingHours = [
    { day: 'Mon - Fri', hours: dealership.openingHours.weekdays || '09:00 am - 06:00 pm' },
    { day: 'Sat', hours: dealership.openingHours.saturday || '10:00 am - 05:00 pm' },
    { day: 'Sun', hours: dealership.openingHours.sunday || 'By Appointment Only' },
  ]

  const phoneNumbers = contactData?.phoneNumbers ?? []
  const emailAddresses = contactData?.emailAddresses ?? []
  const address = contactData?.businessAddress
  const socialLinks = (contactData?.socialLinks ?? []).filter((l) => l.isActive !== false)

  return (
    <div className="bg-black text-white min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '52vh', paddingTop: '5rem' }}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/car_3.jpg')" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-[0.2em] uppercase text-white mb-4">
            Contact Us
          </h1>
          {/* Red accent bar */}
          <div className="flex items-center justify-center gap-0 mx-auto w-32">
            <div className="h-[3px] flex-1 bg-red-600" />
            <div className="w-4 h-4 bg-red-600 rotate-45 -mx-1" />
            <div className="h-[3px] flex-1 bg-red-600" />
          </div>
        </div>
      </section>

      {/* ─── GET IN TOUCH ─── */}
      <section className="py-12 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-3 flex items-center justify-center gap-3 flex-wrap">
          <div className="w-5 h-5 bg-red-600 rotate-45 inline-block shrink-0" />
          Get In Touch With Us
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto text-sm leading-relaxed">
          Get the location, contact details and opening hours. Find out more and get in touch with
          us, or book your test drive online today.
        </p>
      </section>

      {/* ─── INFO CARDS ─── */}
      <section
        className="relative py-16 px-4"
        style={{
          backgroundImage: "url('/car_2.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* ── Contact Details ── */}
          <div>
            <h3 className="text-lg font-black tracking-widest uppercase mb-1">Contact Details</h3>
            <div className="h-[2px] w-16 bg-red-600 mb-6" />

            <div className="space-y-3">
              {phoneNumbers.length > 0 ? (
                phoneNumbers.map((p) => (
                  <a
                    key={p.id ?? p.number}
                    href={`tel:${p.number.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 group"
                  >
                    <span className="w-9 h-9 border border-white/20 flex items-center justify-center shrink-0 group-hover:border-red-500 transition-colors">
                      <Phone size={15} className="text-white/60 group-hover:text-red-500 transition-colors" />
                    </span>
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors tracking-wider">
                      {p.label ? `${p.label}: ` : 'Tel: '}{p.number}
                    </span>
                  </a>
                ))
              ) : (
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 border border-white/20 flex items-center justify-center shrink-0">
                    <Phone size={15} className="text-white/60" />
                  </span>
                  <span className="text-sm text-white/60 tracking-wider">No phone number set</span>
                </div>
              )}

              {address && (
                <div className="flex items-start gap-3 mt-2">
                  <span className="w-9 h-9 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={15} className="text-white/60" />
                  </span>
                  <address className="not-italic text-sm text-white/80 tracking-wider leading-relaxed">
                    {address.name && <span className="block">{address.name}</span>}
                    {address.street && <span className="block">{address.street}</span>}
                    {address.city && address.postcode && (
                      <span className="block">
                        {address.city}, {address.postcode}
                      </span>
                    )}
                    {address.country && <span className="block">{address.country}</span>}
                  </address>
                </div>
              )}
            </div>
          </div>

          {/* ── Send Us an Email ── */}
          <div>
            <h3 className="text-lg font-black tracking-widest uppercase mb-1">Send Us an Email</h3>
            <div className="h-[2px] w-16 bg-red-600 mb-6" />

            <div className="space-y-3">
              {emailAddresses.length > 0 ? (
                emailAddresses.map((e) => (
                  <a
                    key={e.id ?? e.email}
                    href={`mailto:${e.email}`}
                    className="flex items-center gap-3 group"
                  >
                    <span className="w-9 h-9 border border-white/20 flex items-center justify-center shrink-0 group-hover:border-red-500 transition-colors">
                      <Mail size={15} className="text-white/60 group-hover:text-red-500 transition-colors" />
                    </span>
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors tracking-wider">
                      {e.label}
                    </span>
                  </a>
                ))
              ) : (
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 border border-white/20 flex items-center justify-center shrink-0">
                    <Mail size={15} className="text-white/60" />
                  </span>
                  <span className="text-sm text-white/60 tracking-wider">No email addresses set</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Opening Hours + Social ── */}
          <div>
            <h3 className="text-lg font-black tracking-widest uppercase mb-1">Opening Hours</h3>
            <div className="h-[2px] w-16 bg-red-600 mb-6" />

            <table className="w-full text-sm mb-8">
              <tbody>
                {openingHours.map(({ day, hours }) => (
                  <tr key={day} className="border-b border-white/10">
                    <td className="py-2 text-white/70 tracking-wider pr-4 font-medium">{day}</td>
                    <td className="py-2 text-right text-white/90 tracking-wider">{hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {socialLinks.length > 0 && (
              <>
                <h4 className="text-sm font-black tracking-widest uppercase mb-3">Social Media</h4>
                <div className="flex gap-2 flex-wrap">
                  {socialLinks.map((s) => (
                    <a
                      key={s.id ?? s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/60 hover:border-red-500 hover:text-red-500 transition-colors"
                    >
                      {platformIcon(s.platform)}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── CONTACT FORM ─── */}
      <section className="py-16 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="border border-white/10 p-8 md:p-12">
            <h2 className="text-2xl font-black tracking-widest uppercase mb-1">Contact Us</h2>
            <div className="h-[2px] w-full bg-white/10 mb-8" />

            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
