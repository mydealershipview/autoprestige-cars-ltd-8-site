import { NextRequest, NextResponse } from 'next/server'

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

      response.cookies.set('stock_admin_auth', 'authenticated', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/stock-admin',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
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
    path: '/stock-admin',
    maxAge: 0,
  })

  return response
}