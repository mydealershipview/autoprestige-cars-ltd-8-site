import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/payload/CollectionArchive'
import { PageRange } from '@/components/payload/PageRange'
import { Pagination } from '@/components/payload/Pagination'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'
import { getStaticPosts, paginateStaticPosts } from '@/data/staticPosts'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export const revalidate = 600
const PAGE_SIZE = 12

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = paginateStaticPosts(sanitizedPageNumber, PAGE_SIZE)

  if (sanitizedPageNumber > posts.totalPages || sanitizedPageNumber < 1) {
    notFound()
  }

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
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  const dealership = await getDealershipInfo()

  return {
    title: `Posts Page ${pageNumber || ''} | ${dealership.name}`,
  }
}

export async function generateStaticParams() {
  const totalDocs = getStaticPosts().length

  const totalPages = Math.max(1, Math.ceil(totalDocs / PAGE_SIZE))

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
