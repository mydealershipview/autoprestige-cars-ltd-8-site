import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/payload/CollectionArchive'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { searchStaticPosts } from '@/data/staticPosts'
import { getDealershipInfo } from '@/lib/services/dealership.service'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const posts = searchStaticPosts(query || '')

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      {posts.length > 0 ? (
        <CollectionArchive posts={posts} />
      ) : (
        <div className="container">No results found.</div>
      )}
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const dealership = await getDealershipInfo()

  return {
    title: `Search | ${dealership.name}`,
  }
}
