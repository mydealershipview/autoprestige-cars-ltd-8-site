/** Optional custom domain for the existing archive bucket; object paths stay unchanged. */
export function soldImageURL(href: string): string {
  const source = new URL(href.replace('{resize}', 'w800'))
  const base = process.env.SOLD_IMAGES_PUBLIC_BASE_URL
  if (!source.hostname.endsWith('.r2.dev') || !base) return source.toString()
  const target = new URL(base)
  if (target.protocol !== 'https:' || target.username || target.password || target.hostname.endsWith('.r2.dev')) {
    throw new Error('Sold image CDN must be a verified HTTPS custom domain')
  }
  target.pathname = `${target.pathname.replace(/\/$/, '')}${source.pathname}`
  target.search = source.search
  return target.toString()
}
