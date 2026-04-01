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
