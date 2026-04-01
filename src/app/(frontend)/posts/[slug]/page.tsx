import type { Metadata } from 'next'
import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageClient from './page.client'
import { findStaticPostBySlug, getStaticPosts } from '@/data/staticPosts'
import { getDealershipInfo } from '@/lib/services/dealership.service'

export async function generateStaticParams() {
  return getStaticPosts().map((post) => ({ slug: post.slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const post = findStaticPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const related = getStaticPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3)

  return (
    <article className="pt-24 pb-20">
      <PageClient />

      <div className="container max-w-4xl">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-400 mb-4">
          {(post.categories || [])
            .map((category) => (typeof category === 'object' ? category.title : ''))
            .filter(Boolean)
            .join(', ') || 'Article'}
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{post.title}</h1>
        <p className="text-sm text-zinc-500 mb-10">{new Date(post.publishedAt).toLocaleDateString('en-GB')}</p>

        <div className="space-y-6 text-zinc-200 leading-8">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold mb-4">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/posts/${item.slug}`}
                  className="border border-white/20 p-4 hover:border-red-500 transition-colors"
                >
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-400">{item.meta?.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = findStaticPostBySlug(slug)
  const dealership = await getDealershipInfo()

  if (!post) {
    return {
      title: `Post | ${dealership.name}`,
    }
  }

  return {
    title: `${post.title} | ${dealership.name}`,
    description: post.meta?.description || dealership.seoText,
  }
}
