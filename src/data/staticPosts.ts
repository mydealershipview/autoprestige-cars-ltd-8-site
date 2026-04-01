import type { CardPostData } from '@/components/payload/Card'

export type StaticPost = CardPostData & {
  id: string
  slug: string
  publishedAt: string
  content: string[]
}

const STATIC_POSTS: StaticPost[] = [
  {
    id: 'winter-prep',
    slug: 'winter-driving-checklist-for-used-cars',
    title: 'Winter Driving Checklist For Used Cars',
    categories: [{ id: 'care', title: 'Car Care' }],
    meta: {
      title: 'Winter Driving Checklist',
      description:
        'Simple checks that help your used car stay reliable, safe and efficient through winter.',
      image: null,
    },
    publishedAt: '2026-01-12T09:00:00.000Z',
    content: [
      'As temperatures drop, your vehicle needs a few seasonal checks to keep performing well.',
      'Start with tyre condition and pressure, then move on to battery health, wiper blades and coolant levels.',
      'A winter emergency kit with a torch, gloves and jump leads can make a real difference when conditions change quickly.',
    ],
  },
  {
    id: 'finance-guide',
    slug: 'used-car-finance-explained-in-plain-english',
    title: 'Used Car Finance Explained In Plain English',
    categories: [{ id: 'finance', title: 'Finance' }],
    meta: {
      title: 'Used Car Finance Guide',
      description:
        'Understand deposits, monthly payments, APR and how to compare offers with confidence.',
      image: null,
    },
    publishedAt: '2025-12-04T09:00:00.000Z',
    content: [
      'Finance should feel clear, not complicated. Focus on total payable amount, not only monthly cost.',
      'If you are comparing two offers, check term length, deposit requirements and any end-of-agreement fees.',
      'A realistic monthly budget before viewing vehicles helps you shortlist options faster and more confidently.',
    ],
  },
  {
    id: 'part-exchange-tips',
    slug: 'how-to-get-the-best-part-exchange-value',
    title: 'How To Get The Best Part Exchange Value',
    categories: [{ id: 'selling', title: 'Selling Your Car' }],
    meta: {
      title: 'Part Exchange Value Tips',
      description:
        'Practical preparation steps that can help improve your part exchange valuation.',
      image: null,
    },
    publishedAt: '2025-11-11T09:00:00.000Z',
    content: [
      'Gather service history, spare keys and MOT paperwork before your valuation appointment.',
      'A clean interior and exterior will not change the car mechanically, but it improves first impressions.',
      'Be transparent about known issues; accurate details lead to a faster, fairer quote.',
    ],
  },
  {
    id: 'first-used-car',
    slug: 'what-to-look-for-in-your-first-used-car',
    title: 'What To Look For In Your First Used Car',
    categories: [{ id: 'buying', title: 'Buying Advice' }],
    meta: {
      title: 'First Used Car Buying Tips',
      description:
        'A beginner-friendly guide to mileage, service history, ownership costs and test drives.',
      image: null,
    },
    publishedAt: '2025-10-02T09:00:00.000Z',
    content: [
      'Start with running costs: insurance group, road tax and fuel economy can matter more than badge prestige.',
      'Look for consistent service history and use the test drive to listen for unusual noises under different speeds.',
      'Take your time and compare a few options in the same budget range before making a final decision.',
    ],
  },
  {
    id: 'warranty-questions',
    slug: 'used-car-warranty-questions-you-should-ask',
    title: 'Used Car Warranty Questions You Should Ask',
    categories: [{ id: 'warranty', title: 'Warranty' }],
    meta: {
      title: 'Warranty Questions To Ask',
      description:
        'Key warranty questions that help set clear expectations before you buy.',
      image: null,
    },
    publishedAt: '2025-08-18T09:00:00.000Z',
    content: [
      'Ask what parts are included, claim limits, and whether diagnostics are covered.',
      'Clarify service requirements that keep the warranty valid throughout the policy term.',
      'Knowing exactly how to make a claim avoids stress if a problem appears later.',
    ],
  },
  {
    id: 'city-driving',
    slug: 'best-features-for-city-driving-in-a-used-car',
    title: 'Best Features For City Driving In A Used Car',
    categories: [{ id: 'buying', title: 'Buying Advice' }],
    meta: {
      title: 'City Driving Feature Checklist',
      description:
        'The most useful features for urban driving, parking and daily commuting.',
      image: null,
    },
    publishedAt: '2025-06-07T09:00:00.000Z',
    content: [
      'Parking sensors, rear camera and compact turning radius are especially useful in busy towns.',
      'Automatic transmission and adaptive cruise can reduce fatigue in stop-start traffic.',
      'If you mostly drive short trips, prioritize comfort and low-speed visibility over outright performance.',
    ],
  },
]

const sortedPosts = [...STATIC_POSTS].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
)

export const getStaticPosts = (): StaticPost[] => sortedPosts

export const findStaticPostBySlug = (slug: string): StaticPost | null => {
  return sortedPosts.find((post) => post.slug === slug) ?? null
}

export const searchStaticPosts = (query: string): StaticPost[] => {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return sortedPosts
  }

  return sortedPosts.filter((post) => {
    const haystack = [
      post.title,
      post.slug,
      post.meta?.title ?? '',
      post.meta?.description ?? '',
      ...post.content,
      ...(post.categories ?? []).map((category) =>
        typeof category === 'object' ? category.title : '',
      ),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalized)
  })
}

export const paginateStaticPosts = (pageNumber: number, limit = 12) => {
  const totalDocs = sortedPosts.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
  const page = Math.max(1, pageNumber)
  const start = (page - 1) * limit
  const docs = sortedPosts.slice(start, start + limit)

  return {
    docs,
    page,
    totalDocs,
    totalPages,
  }
}
