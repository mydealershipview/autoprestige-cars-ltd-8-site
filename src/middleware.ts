import { NextRequest, NextResponse } from 'next/server'
import { STOCK_ADMIN_COOKIE, verifyStockAdminSession } from '@/utilities/stockAdminSession'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  if (url.hostname === 'www.autoprestigecars.co.uk') {
    url.hostname = 'autoprestigecars.co.uk'
    return NextResponse.redirect(url, 301)
  }
  const headers = new Headers(request.headers)
  headers.set('x-site-pathname', url.pathname)
  if (!url.pathname.startsWith('/stock-admin')) return NextResponse.next({ request: { headers } })
  const loggedIn = await verifyStockAdminSession(request.cookies.get(STOCK_ADMIN_COOKIE)?.value)
  const login = request.nextUrl.pathname === '/stock-admin/login'
  if (login && loggedIn) return NextResponse.redirect(new URL('/stock-admin', request.url))
  if (!login && !loggedIn) return NextResponse.redirect(new URL('/stock-admin/login', request.url))
  return NextResponse.next({ request: { headers } })
}

export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] }
