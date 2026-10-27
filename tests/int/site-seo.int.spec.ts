// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'
import robots from '@/app/robots'
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
    expect(robots().sitemap).toContain('https://autoprestigecars.co.uk/vehicles-sitemap.xml')
    expect(robots().rules).toMatchObject({ disallow: expect.arrayContaining(['/admin', '/stock-admin', '/api']) })
  })
})
