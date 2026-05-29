import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only guard /stock-admin routes, but NOT the login page itself
  if (pathname.startsWith('/stock-admin') && !pathname.startsWith('/stock-admin/login')) {
    const auth = request.cookies.get('stock_admin_auth')?.value
    if (auth !== 'authenticated') {
      return NextResponse.redirect(new URL('/stock-admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/stock-admin/:path*'],
}
