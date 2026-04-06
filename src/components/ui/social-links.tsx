"use client"

import { Facebook, Twitter, Instagram, Linkedin, Youtube, Globe } from "lucide-react"
import { ContactData } from "@/types/contact"

// Fallback social links
export const fallbackSocialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook", platform: "facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter", platform: "twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram", platform: "instagram" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", platform: "linkedin" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube", platform: "youtube" }
]

// Icon mapping for social platforms
const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Instagram, // Using Instagram icon for TikTok as fallback
  whatsapp: Globe, // Using Globe icon for WhatsApp as fallback
  google: Globe,
  other: Globe,
}

interface SocialLinksProps {
  variant?: 'header' | 'mobile' | 'footer'
  className?: string
  contactData?: ContactData | null
}

export default function SocialLinks({ variant = 'header', className = '', contactData }: SocialLinksProps) {
  // Use dynamic social links from CMS or fallback
  const socialLinks = contactData?.socialLinks?.filter(link => link.isActive !== false) || []
  const linksToShow = socialLinks.length > 0 ? socialLinks : fallbackSocialLinks

  const baseClasses = {
    header: "flex gap-3",
    mobile: "flex gap-4 justify-center py-4",
    footer: "flex gap-3"
  }

  const linkClasses = {
    header: "p-2 bg-white/10 rounded-lg hover:bg-[#44903C] !transition-colors text-white",
    mobile: "p-3 bg-gray-100 rounded-lg hover:bg-[#44903C] hover:text-white !transition-colors text-gray-600",
    footer: "p-2 bg-gray-800 rounded-lg hover:bg-[#44903C] !transition-colors text-white"
  }

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      {linksToShow.map((social: any, index) => {
        const IconComponent = social.platform
          ? platformIcons[social.platform as keyof typeof platformIcons] || Globe
          : social.icon || Globe

        const href = social.url || social.href || '#'
        const label = social.customPlatform || social.platform || social.label || 'Social Link'

        return (
          <a
            key={social.id || social.label || index}
            href={href}
            className={linkClasses[variant]}
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
          </a>
        )
      })}
    </div>
  )
}
