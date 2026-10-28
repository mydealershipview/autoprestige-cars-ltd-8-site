import { NextRequest, NextResponse } from 'next/server'
import { STOCK_ADMIN_COOKIE, verifyStockAdminSession } from '@/utilities/stockAdminSession'

// Stock admin pages need a valid signed session (see utilities/stockAdminSession.ts)
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const signedIn = await verifyStockAdminSession(request.cookies.get(STOCK_ADMIN_COOKIE)?.value)

  if (pathname.startsWith('/stock-admin/login')) {
    return signedIn ? NextResponse.redirect(new URL('/stock-admin', request.url)) : NextResponse.next()
  }

  if (pathname.startsWith('/stock-admin') && !signedIn) {
    return NextResponse.redirect(new URL('/stock-admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/stock-admin/:path*'],
}
