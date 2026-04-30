import { getServerSideURL } from '@/utilities/getURL'
import type { DealershipInfo } from '@/types/dealership'

const getSameAsLinks = (dealership: DealershipInfo) => {
  return Object.values(dealership.social).filter((value): value is string => Boolean(value))
}

export const generateStructuredData = (dealership: DealershipInfo) => {
  const baseUrl = getServerSideURL()

  const socialLinks = getSameAsLinks(dealership)
  const addressLine = [dealership.address.line1, dealership.address.line2].filter(Boolean).join(', ')

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AutoDealer',
        '@id': `${baseUrl}/#organization`,
        name: dealership.name,
        alternateName: dealership.name,
        description:
          dealership.seoText ||
          `${dealership.name} is a trusted used car dealership offering prestige dealership vehicles and customer-first support.`,
        url: baseUrl,
        telephone: dealership.phone,
        email: dealership.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: addressLine,
          addressLocality: dealership.address.city,
          postalCode: dealership.address.postcode,
          addressCountry: dealership.address.country || 'GB',
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            description: dealership.openingHours.weekdays,
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Saturday',
            description: dealership.openingHours.saturday,
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Sunday',
            description: dealership.openingHours.sunday,
          }
        ],
        serviceType: ['Used Car Sales', 'Car Finance', 'Part Exchange'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${dealership.name} Used Cars`,
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Car',
                name: 'Quality Used Cars',
                description: 'Carefully inspected, handpicked vehicles from leading manufacturers',
              }
            }
          ]
        },
        logo: {
          '@type': 'ImageObject',
          url: dealership.logoUrl || `${baseUrl}/favicon.svg`,
        },
        sameAs: socialLinks,
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: `${dealership.name} Website`,
        description:
          dealership.seoText ||
          `Explore quality used cars and dealership services from ${dealership.name}.`,
        publisher: {
          '@id': `${baseUrl}/#organization`
        },
        inLanguage: 'en-GB',
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        ]
      },
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}/#webpage`,
        url: baseUrl,
        name: `${dealership.name} | Quality Used Cars`,
        isPartOf: {
          '@id': `${baseUrl}/#website`
        },
        about: {
          '@id': `${baseUrl}/#organization`
        },
        description:
          dealership.seoText ||
          `${dealership.name} offers quality used cars, finance options, and trusted support.`,
        breadcrumb: {
          '@id': `${baseUrl}/#breadcrumb`
        },
        inLanguage: 'en-GB'
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${baseUrl}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl
          }
        ]
      }
    ]
  }
}

export const generateLocalBusinessStructuredData = (dealership: DealershipInfo) => {
  const addressLine = [dealership.address.line1, dealership.address.line2].filter(Boolean).join(', ')

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': '#localbusiness',
    name: dealership.name,
    image: '/website-template-OG.webp',
    telephone: dealership.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: addressLine,
      addressLocality: dealership.address.city,
      postalCode: dealership.address.postcode,
      addressCountry: dealership.address.country || 'GB',
    },
    url: getServerSideURL(),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        description: dealership.openingHours.weekdays,
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        description: dealership.openingHours.saturday,
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        description: dealership.openingHours.sunday,
      }
    ]
  }
}
