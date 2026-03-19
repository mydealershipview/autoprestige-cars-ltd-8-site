import { getServerSideURL } from '@/utilities/getURL'

export const generateStructuredData = () => {
  const baseUrl = getServerSideURL()
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AutoDealer',
        '@id': `${baseUrl}/#organization`,
        name: 'MYDV Autos',
        alternateName: 'MYDV Autos Ltd',
        description: 'Family-run used car dealer in Nottinghamshire offering quality pre-owned vehicles with exceptional customer service and aftercare',
        url: baseUrl,
        telephone: '+441157844104',
        email: 'info@MYDVautosltd.co.uk',
        foundingDate: '2004',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Premium Auto Centre',
          addressLocality: 'Nottingham',
          addressRegion: 'Nottinghamshire',
          addressCountry: 'GB',
          postalCode: 'NG1 1AA'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 52.9548,
          longitude: -1.1581
        },
        areaServed: [
          {
            '@type': 'State',
            name: 'Nottinghamshire'
          },
          {
            '@type': 'City',
            name: 'Nottingham'
          },
          {
            '@type': 'City',
            name: 'Derby'
          },
          {
            '@type': 'City',
            name: 'Leicester'
          },
          {
            '@type': 'City',
            name: 'Mansfield'
          }
        ],
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '10:00',
            closes: '18:00'
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Sunday',
            opens: '10:00',
            closes: '15:00'
          }
        ],
        makesOffered: [
          'Audi',
          'BMW',
          'Citroen',
          'Ford',
          'Hyundai',
          'Land Rover',
          'Mercedes',
          'Skoda',
          'Vauxhall',
          'Volvo',
          'Nissan',
          'Volkswagen',
          'Toyota'
        ],
        serviceType: [
          'Used Car Sales',
          'Car Finance',
          'Part Exchange',
          'Vehicle Delivery',
          'Indoor Showroom'
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Used Cars Nottingham',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Car',
                name: 'Quality Used Cars',
                description: 'Carefully inspected, handpicked vehicles from leading manufacturers'
              }
            }
          ]
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '150'
        },
        priceRange: '£5,000 - £50,000',
        paymentAccepted: ['Cash', 'Credit Card', 'Finance', 'Part Exchange'],
        currenciesAccepted: 'GBP',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/favicon.svg`,
          width: 512,
          height: 512
        },
        image: {
          '@type': 'ImageObject',
          url: `${baseUrl}/website-template-OG.webp`,
          width: 1200,
          height: 630
        },
        sameAs: [
          'https://www.facebook.com/MYDVautos',
          'https://www.instagram.com/MYDVautos',
          'https://www.linkedin.com/company/MYDV-autos'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'MYDV Autos - Used Car Dealers Nottingham',
        description: 'Trusted family-run used car dealers in Nottingham offering quality pre-owned vehicles',
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
        name: 'MYDV Autos - Trusted Used Car Dealers Nottingham | Quality Pre-Owned Vehicles',
        isPartOf: {
          '@id': `${baseUrl}/#website`
        },
        about: {
          '@id': `${baseUrl}/#organization`
        },
        description: 'MYDV Autos - Your reliable family-run used car dealer in Nottinghamshire. Quality used cars from Audi, BMW, Ford, Mercedes & more.',
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

export const generateLocalBusinessStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': '#localbusiness',
    name: 'MYDV Autos',
    image: '/website-template-OG.webp',
    telephone: '+441157844104',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Premium Auto Centre',
      addressLocality: 'Nottingham',
      addressRegion: 'Nottinghamshire',
      postalCode: 'NG1 1AA',
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 52.9548,
      longitude: -1.1581
    },
    url: getServerSideURL(),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '10:00',
        closes: '15:00'
      }
    ]
  }
}
