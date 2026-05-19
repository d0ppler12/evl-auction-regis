import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isAuthenticated(request: NextRequest) {
  const adminToken = request.cookies.get('admin_token')
  return adminToken?.value === 'authenticated'
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Protect admin dashboard pages
  if (path.startsWith('/admin/dashboard')) {
    if (!isAuthenticated(request)) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Protect admin API routes (except login/logout)
  if (
    path.startsWith('/api/admin/') &&
    !path.startsWith('/api/admin/login') &&
    !path.startsWith('/api/admin/logout')
  ) {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Redirect /admin directly to dashboard which will then be protected or redirected to login
  if (request.nextUrl.pathname === '/admin') {
     const dashboardUrl = new URL('/admin/dashboard', request.url)
     return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
}
