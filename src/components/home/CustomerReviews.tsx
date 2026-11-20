import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { StarRating } from '@/components/StarRating'
import { GOOGLE_REVIEW_URL, TESTIMONIALS } from '@/data/testimonials'

/** Buying, service and selling-to-us stories, from the Testimonials page list. */
export const HOMEPAGE_REVIEWERS = ['Paul G', 'Waquas A', 'Tom R']

/**
 * Upgrade spec: reviews on the homepage. Autoprestige hasn't connected Google reviews in the DMS
 * (20/11/2026: no locations, no reviews), so this shows their own testimonials. No review
 * structured data: Google doesn't use a business's own testimonials for star ratings.
 */
export function CustomerReviews() {
  const reviews = HOMEPAGE_REVIEWERS.map((name) => TESTIMONIALS.find((t) => t.name === name)).filter(
    (t): t is (typeof TESTIMONIALS)[number] => Boolean(t),
  )
  if (reviews.length === 0) return null

  return (
    <section aria-labelledby="customer-reviews" className="relative w-full bg-black border-t-4 border-blue-500">
      <div className="px-6 lg:px-12 pt-14 pb-16">
        <div className="mb-10">
          <div className="flex items-center mb-3">
            <div className="w-6 h-5 bg-blue-500 mr-4 shrink-0 -skew-x-24" />
            <h2 id="customer-reviews" className="text-3xl lg:text-4xl font-black tracking-widest uppercase text-white leading-tight">
              WHAT OUR CUSTOMERS SAY
            </h2>
          </div>
          <p className="text-sm text-zinc-500 tracking-[0.18em] font-semibold uppercase ml-10">
            From customers who bought from us and sold to us
          </p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <li
              key={review.name}
              className="border border-white/20 p-8 flex flex-col items-center text-center hover:border-blue-500 transition-colors"
            >
              <StarRating count={review.rating} />
              <div className="w-12 h-0.5 bg-blue-500 mb-5" />
              <blockquote className="text-white/85 text-sm leading-relaxed flex-1 mb-6">{review.text}</blockquote>
              <p className="font-black tracking-widest text-sm uppercase">{review.name}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-2 border border-blue-500 px-6 py-3 text-sm font-bold tracking-widest uppercase text-white hover:bg-blue-500 transition-colors"
          >
            Read all reviews <ChevronRight className="h-4 w-4" />
          </Link>
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold tracking-widest uppercase text-white/70 hover:text-blue-400 transition-colors"
          >
            Leave a Google review
          </a>
        </div>
      </div>
    </section>
  )
}
