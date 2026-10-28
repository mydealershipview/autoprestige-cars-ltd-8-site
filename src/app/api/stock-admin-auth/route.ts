import { NextRequest, NextResponse } from 'next/server'
import {
  STOCK_ADMIN_COOKIE,
  createStockAdminSession,
  stockAdminCookieOptions,
} from '@/utilities/stockAdminSession'

const ADMIN_CREDENTIALS = [
  {
    username: 'stockadmin',
    password: 'AutoPrestige2025!',
  },
  {
    username: 'autoprestige',
    password: 'AutoPrestigeAdmin!',
  },
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body as {
      username?: string
      password?: string
    }

    const isValidAdmin = ADMIN_CREDENTIALS.some(
      admin =>
        admin.username === username &&
        admin.password === password
    )

    if (isValidAdmin) {
      const response = NextResponse.json({ success: true })

      // A signed session (username + expiry), not a fixed value anyone could set
      response.cookies.set(STOCK_ADMIN_COOKIE, await createStockAdminSession(username!), stockAdminCookieOptions)
      return response
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 400 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })

  response.cookies.set('stock_admin_auth', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  response.cookies.set('stock_admin_auth', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/stock-admin',
    maxAge: 0,
  })

  return response
}
