import { NextRequest, NextResponse } from 'next/server'
import { STOCK_ADMIN_COOKIE, verifyStockAdminSession } from '@/utilities/stockAdminSession'

export async function middleware(request: NextRequest) {
  const loggedIn = await verifyStockAdminSession(request.cookies.get(STOCK_ADMIN_COOKIE)?.value)
  const login = request.nextUrl.pathname === '/stock-admin/login'
  if (login && loggedIn) return NextResponse.redirect(new URL('/stock-admin', request.url))
  if (!login && !loggedIn) return NextResponse.redirect(new URL('/stock-admin/login', request.url))
  return NextResponse.next()
}

export const config = { matcher: ['/stock-admin/:path*'] }
