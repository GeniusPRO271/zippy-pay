"use client"

import { useProviders } from "@/hooks/provider/useProviders"
import { ProvidersTable } from "@/components/dashboard/providers/providers-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProvidersPage() {
  const { data: providers, isLoading } = useProviders()

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-bold tracking-tight text-balance mb-4">
        Providers
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <ProvidersTable data={providers ?? []} />
      )}
    </>
  )
}
