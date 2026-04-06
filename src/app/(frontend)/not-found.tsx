import Link from 'next/link'
import { Metadata } from 'next'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Page Not Found | ${dealership.name}`,
    description: `The page you're looking for could not be found. Return to explore vehicles at ${dealership.name}.`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center px-4">
        <div className="mb-6 relative">
          <h1 className="text-8xl md:text-9xl font-black tracking-[0.2em] text-white/5 mx-auto">404</h1>
        </div>
        <h2 className="text-2xl md:text-4xl font-black tracking-widest uppercase mb-4 flex items-center justify-center gap-3">
          <div className="w-6 h-5 bg-blue-500 -skew-x-[24deg] inline-block shrink-0" />
          Page Not Found
        </h2>
        <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to exploring our collection.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-500 text-white text-sm font-bold tracking-widest uppercase hover:bg-blue-600 !transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/used-cars"
            className="inline-flex items-center justify-center px-8 py-3 bg-transparent border border-white/20 text-white text-sm font-bold tracking-widest uppercase hover:bg-white/10 !transition-colors"
          >
            Browse Showroom
          </Link>
        </div>
      </div>
    </div>
  )
}
