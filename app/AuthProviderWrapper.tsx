// app/AuthProviderWrapper.tsx (SERVER COMPONENT)
import { getSession } from "@/app/lib/session"
import { AuthProvider } from "@/context/auth"

export default async function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <AuthProvider
      initialState={{
        email: session?.email ?? null,
        isAuthenticated: !!session,
        loading: false,
      }}
    >
      {children}
    </AuthProvider>
  )
}
