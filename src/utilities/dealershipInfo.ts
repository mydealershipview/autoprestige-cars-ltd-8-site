import type { ContactData } from '@/types/contact'
import type { DealershipInfo } from '@/types/dealership'

const socialPlatforms: Array<keyof DealershipInfo['social']> = [
  'facebook',
  'instagram',
  'twitter',
  'youtube',
  'tiktok',
  'linkedin',
]

export const mapDealershipInfoToContactData = (
  dealership: DealershipInfo,
): ContactData => {
  const socialLinks = socialPlatforms
    .map((platform) => {
      const url = dealership.social[platform]
      if (!url) {
        return null
      }

      return {
        platform,
        url,
        isActive: true,
      }
    })
    .filter(Boolean) as NonNullable<ContactData['socialLinks']>

  return {
    phoneNumbers: dealership.phone
      ? [
          {
            label: 'Sales',
            number: dealership.phone,
            isPrimary: true,
          },
        ]
      : [],
    whatsappNumber: dealership.whatsapp || null,
    emailAddresses: dealership.email
      ? [
          {
            label: 'Email',
            email: dealership.email,
            isPrimary: true,
          },
        ]
      : [],
    socialLinks,
    businessAddress: {
      name: dealership.name,
      street: [dealership.address.line1, dealership.address.line2]
        .filter(Boolean)
        .join(', '),
      city: dealership.address.city,
      postcode: dealership.address.postcode,
      country: dealership.address.country,
    },
  }
}

export const getDealershipMapsUrl = (dealership: DealershipInfo): string => {
  const addressParts = [
    dealership.address.line1,
    dealership.address.line2,
    dealership.address.city,
    dealership.address.postcode,
    dealership.address.country,
  ].filter(Boolean)

  if (addressParts.length === 0) {
    return 'https://maps.google.com'
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressParts.join(', '))}`
}

/**
 * Where the showroom is, for sentences (upgrade spec copy fixes, 20/11/2026). The website admin
 * holds the town in the second address line and the county in "city" (Rosse Street / Bradford /
 * West Yorkshire), so writing "{city}, West Yorkshire" printed "West Yorkshire, West Yorkshire".
 * The town is the address part that isn't the county; this stays right if the admin is corrected.
 */
const isCounty = (part: string) => /yorkshire$/i.test(part)
const clean = (parts: Array<string | undefined>) => {
  const seen = new Set<string>()
  return parts
    .map((part) => part?.trim() ?? '')
    .filter((part) => part && !seen.has(part.toLowerCase()) && seen.add(part.toLowerCase()))
}

/** "Bradford" */
export const showroomTown = (dealership: DealershipInfo): string =>
  clean([dealership.address.city, dealership.address.line2]).find((part) => !isCounty(part)) || 'Bradford'

/** "Bradford, West Yorkshire" */
export const showroomArea = (dealership: DealershipInfo): string => `${showroomTown(dealership)}, West Yorkshire`

/** "Rosse Street, Bradford, West Yorkshire, BD8 9AS" */
export const showroomAddress = (dealership: DealershipInfo): string =>
  clean([
    dealership.address.line1,
    dealership.address.line2,
    showroomTown(dealership),
    'West Yorkshire',
    dealership.address.postcode,
  ]).join(', ')

/** "07725124729" -> "07725 124729" (UK 11-digit numbers); anything else unchanged */
export const formatUkPhone = (phone?: string): string => {
  const digits = (phone ?? '').replace(/\s+/g, '')
  return /^0\d{10}$/.test(digits) ? `${digits.slice(0, 5)} ${digits.slice(5)}` : phone ?? ''
}

/**
 * The site description for search results (upgrade spec: a unique meta description, 20/11/2026).
 * Written here because the website admin isn't used: its "SEO text" held only the page title. The
 * admin value is kept, commented out where it was read, in case the admin is used again.
 */
export const siteDescription = (dealership: DealershipInfo): string => {
  const phone = formatUkPhone(dealership.phone)
  return `${dealership.name}, ${showroomTown(dealership)}: hand-picked prestige and performance cars, with finance, part exchange and warranty. View our latest stock${phone ? ` or call ${phone}` : ''}.`
}
