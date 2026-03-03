"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth"
import { UserManagement } from "@/components/users/user-management"

export default function UsersPage() {
  const { auth } = useAuth()
  const router = useRouter()
  const isSuperAdmin = auth.role === "superadmin"

  useEffect(() => {
    if (!auth.loading && !isSuperAdmin) {
      router.replace("/")
    }
  }, [auth.loading, isSuperAdmin, router])

  if (!isSuperAdmin) {
    return null
  }

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-bold tracking-tight text-balance mb-4">
        Users
      </h1>
      <UserManagement />
    </>
  )
}
