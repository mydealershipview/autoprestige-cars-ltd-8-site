// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CustomerReviews, HOMEPAGE_REVIEWERS } from '@/components/home/CustomerReviews'
import { TESTIMONIALS } from '@/data/testimonials'

describe('homepage customer reviews (upgrade spec)', () => {
  it('every homepage reviewer is in the Testimonials list', () => {
    for (const name of HOMEPAGE_REVIEWERS) expect(TESTIMONIALS.map((t) => t.name)).toContain(name)
  })
  it('shows the three reviews, links to all reviews and Google, no review structured data', () => {
    const html = renderToStaticMarkup(CustomerReviews()!)
    expect(html.match(/<li/g)).toHaveLength(3)
    expect(html).toContain('href="/testimonials"')
    expect(html).toContain('search.google.com/local/writereview')
    expect(html).not.toContain('application/ld+json')
  })
  it('the Testimonials page still has all 12', () => {
    expect(TESTIMONIALS).toHaveLength(12)
  })
})
