import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Vehicle Listings | Car Dealership',
    description: 'Browse our extensive collection of quality used cars. Find your perfect vehicle with our advanced search filters.',
    keywords: 'used cars, car dealership, vehicle listings, cars for sale',
}

export default function ListingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
