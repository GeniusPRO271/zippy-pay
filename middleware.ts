// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from './app/lib/session'
import { refreshTokenIfNeeded } from './app/lib/token-refresh'

const protectedRoutes = ['/']
const publicRoutes = ['/auth/login', '/auth/signup']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)

  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie)

  if (isProtectedRoute && !session?.accessToken) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (isPublicRoute && session?.accessToken) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (session?.accessToken) {
    const response = await refreshTokenIfNeeded(session, req)
    if (response) return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
