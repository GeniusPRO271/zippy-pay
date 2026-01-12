'use server'

import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET
if (!secretKey) throw new Error('SESSION_SECRET must be set')
const encodedKey = new TextEncoder().encode(secretKey)

export type SessionPayload = {
  accessToken: string
  refreshToken: string
  email: string
  expiresAt: Date
}

export type JWTPayload = {
  accessToken: string
  refreshToken: string
  email: string
  expiresAt: number
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    email: payload.email,
    expiresAt: payload.expiresAt.getTime(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1m')
    .sign(encodedKey)
}

export async function decrypt(session?: string): Promise<JWTPayload | null> {
  if (!session) return null

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as JWTPayload
  } catch (error) {
    console.warn('[Session] Verification failed:', error)
    return null
  }
}

export async function createSession(data: {
  accessToken: string
  refreshToken: string
  email: string
}): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const encrypted = await encrypt({ ...data, expiresAt })

  const cookieStore = await cookies()
  cookieStore.set('session', encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  return decrypt(session)
}
