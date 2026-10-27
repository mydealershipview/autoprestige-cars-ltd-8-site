/** Browser and CDN caching for stock API responses: reuse for 1 minute, shared caches 5 minutes, then revalidate. */
export const stockCacheHeaders = { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=60' }
/** Errors and missing vehicles are never cached. */
export const noStoreHeaders = { 'Cache-Control': 'no-store' }
