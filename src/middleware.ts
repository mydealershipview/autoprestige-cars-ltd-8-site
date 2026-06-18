import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const auth = request.cookies.get('stock_admin_auth')?.value

  if (pathname.startsWith('/stock-admin/login')) {
    if (auth === 'authenticated') {
      const response = NextResponse.redirect(new URL('/stock-admin', request.url))
      response.cookies.set('stock_admin_auth', 'authenticated', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
      return response
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/stock-admin')) {
    if (auth !== 'authenticated') {
      return NextResponse.redirect(new URL('/stock-admin/login', request.url))
    }

    const response = NextResponse.next()
    response.cookies.set('stock_admin_auth', 'authenticated', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/stock-admin/:path*'],
}
