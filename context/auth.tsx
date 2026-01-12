"use client"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { logout as serverLogout } from "@/app/actions/auth"

type AuthState = {
  email: string | null
  isAuthenticated: boolean
  loading: boolean
}

type AuthContextType = {
  auth: AuthState
  logout: () => Promise<void>
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000

export function AuthProvider({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState: AuthState
}) {
  const [auth, setAuth] = useState<AuthState>(initialState)
  const router = useRouter()
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isRefreshingRef = useRef(false)

  const handleLogout = useCallback(async () => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
      refreshTimerRef.current = null
    }

    setAuth({
      email: null,
      isAuthenticated: false,
      loading: false,
    })

    await serverLogout()
  }, [])

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) {
      return false
    }

    isRefreshingRef.current = true

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        router.refresh()
        return true
      } else {
        await handleLogout()
        return false
      }
    } catch (error) {
      console.error('[Auth] Token refresh failed:', error)
      await handleLogout()
      return false
    } finally {
      isRefreshingRef.current = false
    }
  }, [router, handleLogout])

  useEffect(() => {
    if (!auth.isAuthenticated) {
      return
    }

    refreshSession()

    refreshTimerRef.current = setInterval(() => {
      refreshSession()
    }, TOKEN_REFRESH_INTERVAL)

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
    }
  }, [auth.isAuthenticated, refreshSession])

  useEffect(() => {
    if (!auth.isAuthenticated) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [auth.isAuthenticated, refreshSession])

  useEffect(() => {
    if (!auth.isAuthenticated) return

    const handleFocus = () => {
      refreshSession()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [auth.isAuthenticated, refreshSession])

  return (
    <AuthContext.Provider
      value={{
        auth,
        logout: handleLogout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
