import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createStockAdminSession, STOCK_ADMIN_COOKIE, stockAdminCookieOptions } from '@/utilities/stockAdminSession'

export async function POST(req: NextRequest) {
  if (req.headers.get('origin') && req.headers.get('origin') !== new URL(req.url).origin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  let body: { username?: string; password?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }
  if (typeof body.username !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.login({ collection: 'users', data: { email: body.username, password: body.password } })
    if (!user?.roles?.includes('admin')) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const response = NextResponse.json({ success: true })
    response.cookies.set(STOCK_ADMIN_COOKIE, await createStockAdminSession(String(user.id)), stockAdminCookieOptions)
    return response
  } catch {
    return NextResponse.json({ error: 'Unable to sign in with these credentials' }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(STOCK_ADMIN_COOKIE, '', { ...stockAdminCookieOptions, maxAge: 0 })
  response.cookies.set(STOCK_ADMIN_COOKIE, '', { ...stockAdminCookieOptions, path: '/stock-admin', maxAge: 0 })
  return response
}
