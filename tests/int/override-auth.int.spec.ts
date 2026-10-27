// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({ connect: vi.fn(), write: vi.fn(() => ({ lean: () => Promise.resolve({ stockId: 'car' }) })), remove: vi.fn() }))
vi.mock('@/lib/db/connect', () => ({ default: mocks.connect }))
vi.mock('@/lib/db/models/vehicleOverride.model', () => ({ default: { findOneAndUpdate: mocks.write, deleteOne: mocks.remove } }))
import { PUT, DELETE } from '@/app/api/vehicle-overrides/[stockId]/route'
import { createStockAdminSession } from '@/utilities/stockAdminSession'
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('PAYLOAD_SECRET', 'a'.repeat(32)) })
describe('vehicle override authorization', () => {
  it.each([PUT, DELETE])('rejects missing and forged cookies before database access', async handler => {
    for (const cookie of ['', 'stock_admin_auth=authenticated']) {
      const result = await handler(new NextRequest('http://localhost/api/vehicle-overrides/car', { headers: { cookie } }), { params: Promise.resolve({ stockId: 'car' }) })
      expect(result.status).toBe(401)
    }
    expect(mocks.connect).not.toHaveBeenCalled()
  })
  it('allows a signed admin session to update a price', async () => {
    const token = await createStockAdminSession('admin')
    const result = await PUT(new NextRequest('http://localhost/api/vehicle-overrides/car', { method: 'PUT', headers: { cookie: `stock_admin_auth=${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ listingPrice: 10000 }) }), { params: Promise.resolve({ stockId: 'car' }) })
    expect(result.status).toBe(200)
    expect(mocks.write).toHaveBeenCalledWith({ stockId: 'car' }, { $set: { listingPrice: 10000 } }, expect.anything())
  })
})
