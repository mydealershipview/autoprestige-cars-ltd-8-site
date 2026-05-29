import { NextRequest, NextResponse } from 'next/server'

// Hardcoded admin credentials — change these as needed
const ADMIN_USERNAME = 'stockadmin'
const ADMIN_PASSWORD = 'AutoPrestige2025!'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body as { username?: string; password?: string }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true })
      // Set a simple session cookie (httpOnly so JS can't read it)
      response.cookies.set('stock_admin_auth', 'authenticated', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/stock-admin',
        maxAge: 60 * 60 * 8, // 8 hours
      })
      return response
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
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
