// @vitest-environment node
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import { NextRequest } from 'next/server'
import { POST as login } from '@/app/api/stock-admin-auth/route'
import { verifyStockAdminSession } from '@/utilities/stockAdminSession'
import { guardLead } from '@/utilities/leadSpamGuard'

let payload: Payload
const userIds: string[] = []

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
  afterAll(async () => {
    for (const id of userIds) await payload.delete({ collection: 'users', id })
  })

  it('denies anonymous access to private payment and listing collections', async () => {
    for (const collection of ['payments', 'listings'] as const) {
      await expect(payload.find({ collection, overrideAccess: false })).rejects.toThrow()
      await expect(payload.create({ collection, data: {}, overrideAccess: false })).rejects.toThrow()
    }
  })

  it('logs in CMS admins with an expiring signed cookie and rejects ordinary users', async () => {
    for (const role of ['admin', 'user'] as const) {
      const email = `review-${role}-${Date.now()}@example.com`
      const user = await payload.create({ collection: 'users', data: { email, password: 'Review-only-strong-password-42', roles: [role] } })
      userIds.push(String(user.id))
      const response = await login(new NextRequest('http://localhost/api/stock-admin-auth', { method: 'POST', body: JSON.stringify({ username: email, password: 'Review-only-strong-password-42' }) }))
      expect(response.status).toBe(role === 'admin' ? 200 : 401)
      if (role === 'admin') {
        expect(await verifyStockAdminSession(response.cookies.get('stock_admin_auth')?.value)).toBe(true)
        expect(response.headers.get('set-cookie')).toContain('HttpOnly')
        expect(response.headers.get('set-cookie')).toContain('SameSite=strict')
      }
    }
  })

  it('enforces the shared limit atomically under concurrent submissions', async () => {
    const ip = `review-${Date.now()}`
    const results = await Promise.all(Array.from({ length: 12 }, () => guardLead(new NextRequest('http://localhost/api/submit-form', { headers: { 'x-forwarded-for': ip } }), {})))
    expect(results.filter(result => result === null)).toHaveLength(10)
    expect(results.filter(result => result?.status === 429)).toHaveLength(2)
  })

})
