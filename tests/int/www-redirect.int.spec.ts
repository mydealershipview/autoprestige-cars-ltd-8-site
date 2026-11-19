// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'
const request = (headers: Record<string, string>) => new NextRequest('http://localhost:3000/used-cars?utm_source=ad', { headers })
describe('www redirect', () => {
  it.each([
    ['host header', { host: 'www.autoprestigecars.co.uk' }],
    ['forwarded host from the proxy', { host: 'localhost:3000', 'x-forwarded-host': 'www.autoprestigecars.co.uk' }],
  ])('uses a permanent redirect for the %s and keeps path and parameters', async (_name, headers) => {
    const response = await middleware(request(headers))
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('https://autoprestigecars.co.uk/used-cars?utm_source=ad')
  })
  it('does not redirect the main domain', async () => {
    expect((await middleware(request({ host: 'autoprestigecars.co.uk' }))).status).toBe(200)
  })
})
