import { NextRequest, NextResponse } from 'next/server'
import { encrypt, JWTPayload } from './session'
import { postRefreshToken } from '@/lib/api/auth/login'

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000

export async function refreshTokenIfNeeded(
  session: JWTPayload,
  req?: NextRequest
): Promise<NextResponse | null> {
  const now = Date.now()
  const timeUntilExpiry = session.expiresAt - now

  if (timeUntilExpiry > REFRESH_THRESHOLD_MS) {
    return null
  }

  if (timeUntilExpiry <= 0) {
    return redirectToLogin(req)
  }

  try {
    const data = await postRefreshToken({
      refreshToken: session.refreshToken,
    })

    const newExpiresAt = Date.now() + data.expiresIn * 1000
    const encrypted = await encrypt({
      accessToken: data.accessToken,
      refreshToken: session.refreshToken,
      email: data.email,
      role: data.role,
      expiresAt: new Date(newExpiresAt),
    })

    const response = NextResponse.next()
    response.cookies.set('session', encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(newExpiresAt),
    })

    return response
  } catch (error) {
    console.error('[Token Refresh] Failed:', error)
    return redirectToLogin(req)
  }
}

function redirectToLogin(req?: NextRequest): NextResponse {
  if (!req) {
    return NextResponse.redirect(new URL('/auth/login', 'http://localhost:3000'))
  }
  return NextResponse.redirect(new URL('/auth/login', req.url))
}
