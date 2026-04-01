import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/payload/CollectionArchive'
import { PageRange } from '@/components/payload/PageRange'
import { Pagination } from '@/components/payload/Pagination'
import React from 'react'
import PageClient from './page.client'
import { paginateStaticPosts } from '@/data/staticPosts'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const posts = paginateStaticPosts(1, 12)

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose max-w-none">
          <h1>Posts</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Posts | ${dealership.name}`,
  }
}
