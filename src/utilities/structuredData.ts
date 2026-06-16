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
          `${dealership.name} is Purveyors of Fine Automobiles, a trusted independent used car dealership in ${dealership.address.city || 'Bradford'}, West Yorkshire, specialising in prestige and performance vehicles with car finance, part exchange, and warranty available.`,
        url: baseUrl,
        telephone: dealership.phone,
        email: dealership.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: addressLine,
          addressLocality: dealership.address.city || 'Bradford',
          addressRegion: 'West Yorkshire',
          postalCode: dealership.address.postcode,
          addressCountry: dealership.address.country || 'GB',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: dealership.address.lat || '53.7959',
          longitude: dealership.address.lng || '-1.7594',
        },
        areaServed: {
          '@type': 'City',
          name: dealership.address.city || 'Bradford',
          sameAs: 'https://en.wikipedia.org/wiki/Bradford',
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:00',
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Saturday',
            opens: '09:00',
            closes: '17:00',
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Sunday',
            opens: '10:00',
            closes: '16:00',
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
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '125',
          bestRating: '5',
        },
        logo: {
          '@type': 'ImageObject',
          url: dealership.logoUrl || `${baseUrl}/logo.png`,
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
      },
      {
        '@type': 'FAQPage',
        '@id': `${baseUrl}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What types of vehicles does Autoprestige Cars sell?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${dealership.name} specialises in prestige and performance vehicles from leading manufacturers including BMW, Mercedes-Benz, Audi, Land Rover, and Porsche. Every vehicle is hand-picked and undergoes a rigorous multi-point inspection before sale.`,
            },
          },
          {
            '@type': 'Question',
            name: 'Do you offer car finance?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes, ${dealership.name} offers flexible car finance options including Hire Purchase (HP) and Personal Contract Purchase (PCP). As an FCA-authorised credit broker (FCA No. ${dealership.fcaNumber || '715892'}), we work with a panel of carefully selected lenders to find competitive rates. Apply online or speak to our finance team.`,
            },
          },
          {
            '@type': 'Question',
            name: 'Can I part exchange my current car?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes, ${dealership.name} offers competitive part exchange valuations. Simply provide your vehicle details online or visit our showroom in ${dealership.address.city || 'Bradford'} for a no-obligation valuation. We accept part exchanges against any vehicle in our inventory, or we can purchase your car outright.`,
            },
          },
          {
            '@type': 'Question',
            name: 'Do your vehicles come with a warranty?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes, all vehicles from ${dealership.name} come with warranty protection. We partner with leading providers including the RAC to offer extended warranty coverage. Plans range from basic powertrain protection to fully comprehensive packages. Speak to our team about the right cover for your vehicle.`,
            },
          },
          {
            '@type': 'Question',
            name: 'Where is Autoprestige Cars located?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${dealership.name} is based in ${dealership.address.city || 'Bradford'}, West Yorkshire. Our showroom is open Monday to Friday 9am–6pm, Saturday 9am–5pm, and Sunday by appointment. Call us on ${dealership.phone || '01274 488500'} or visit our contact page for directions.`,
            },
          },
        ],
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
