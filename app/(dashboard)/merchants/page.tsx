"use client"

import { useMerchants } from "@/hooks/merchant/useMerchants"
import { MerchantsTable } from "@/components/dashboard/merchants/merchants-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function MerchantsPage() {
  const { data: merchants, isLoading } = useMerchants()

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-bold tracking-tight text-balance mb-4">
        Merchants
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <MerchantsTable data={merchants ?? []} />
      )}
    </>
  )
}
