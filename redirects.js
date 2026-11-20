const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // Images renamed for search (20/11/2026): old addresses keep working for anything that linked them
  const renamedImages = [
    { source: '/car_2.jpg', destination: '/prestige-performance-car-nissan-gtr.jpg', permanent: true },
    { source: '/car.png', destination: '/prestige-car-finance-ferrari.png', permanent: true },
  ]

  const redirects = [internetExplorerRedirect, ...renamedImages]

  return redirects
}

export default redirects
