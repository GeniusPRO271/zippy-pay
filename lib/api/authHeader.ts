'use server'
import { decrypt } from '@/app/lib/session'
import { cookies } from 'next/headers'

export async function getAuthHeaders() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  if (!sessionCookie) return {}

  const payload = await decrypt(sessionCookie)
  if (!payload?.accessToken) return {}

  return { Authorization: `Bearer ${payload.accessToken}` }
}
