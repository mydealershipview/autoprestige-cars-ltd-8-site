// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'
import { createRequire } from 'node:module'
const sitemapConfig = createRequire(import.meta.url)('../../next-sitemap.config.cjs')
describe('indexing and canonical routing', () => {
  it('provides the trusted pathname for page-specific canonical links', async () => {
    const result = await middleware(new NextRequest('https://autoprestigecars.co.uk/usedcars/bmw-320-2020-stock?utm_source=test', { headers: { 'x-site-pathname': '/forged' } }))
    expect(result.headers.get('x-middleware-request-x-site-pathname')).toBe('/usedcars/bmw-320-2020-stock')
  })
  it('permanently redirects www while preserving paths and queries', async () => {
    const result = await middleware(new NextRequest('https://www.autoprestigecars.co.uk/usedcars?make=BMW'))
    expect(result.status).toBe(301)
    expect(result.headers.get('location')).toBe('https://autoprestigecars.co.uk/usedcars?make=BMW')
  })
  it('rejects the legacy admin cookie on protected pages', async () => {
    const result = await middleware(new NextRequest('https://autoprestigecars.co.uk/stock-admin', { headers: { cookie: 'stock_admin_auth=authenticated' } }))
    expect(result.headers.get('location')).toBe('https://autoprestigecars.co.uk/stock-admin/login')
  })
  it('publishes production sitemaps and excludes private routes', () => {
    // robots.txt is generated after the build by next-sitemap (31/10/2026): every crawler allowed, admin logins blocked
    expect(sitemapConfig.generateRobotsTxt).toBe(true)
    expect(sitemapConfig.robotsTxtOptions.additionalSitemaps).toContain('https://autoprestigecars.co.uk/vehicles-sitemap.xml')
    expect(sitemapConfig.robotsTxtOptions.policies[0].disallow).toEqual(expect.arrayContaining(['/websiteadmin', '/stock-admin']))
  })
})
