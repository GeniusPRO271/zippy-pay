"use client"

import * as React from "react"
import TransactionsFilterBar from "@/components/dashboard/transactions/transactions-filters"
import { TransactionsTable } from "@/components/dashboard/transactions/transactions-table"
import { transactionColumns } from "@/components/dashboard/transactions/transactions-columns"
import { useCountries } from "@/hooks/country/useCountries"
import { useProviders } from "@/hooks/provider/useProviders"
import { useMerchants } from "@/hooks/merchant/useMerchants"
import { usePayMethods } from "@/hooks/payMethod/usePayMethod"
import { TransactionFilters } from "@/lib/types/transactions"
import { useTransactions } from "@/hooks/transactions/useTransactions"
import { Skeleton } from "@/components/ui/skeleton"

const defaultFilters: TransactionFilters = {
  methodType: undefined,
  payMethodId: [],
  status: [],
  merchantId: [],
  providerId: [],
  countryId: [],
  requestDateFrom: undefined,
  requestDateTo: undefined,
  transferDateFrom: undefined,
  transferDateTo: undefined,
  searchName: undefined,
  searchEmail: undefined,
  searchIdDocument: undefined,
  amountMin: undefined,
  amountMax: undefined,
  searchZippyId: undefined,
  searchMerchantId: undefined,
}

export default function TransactionsPage() {
  const { data: countries } = useCountries()
  const { data: providers } = useProviders()
  const { data: merchants } = useMerchants()
  const { data: payMethods } = usePayMethods()

  const [filters, setFilters] = React.useState<TransactionFilters>(defaultFilters)
  const [page, setPage] = React.useState(1)
  const pageSize = 25

  // Reset to page 1 when filters change
  const handleSetFilters = React.useCallback((newFilters: TransactionFilters | ((prev: TransactionFilters) => TransactionFilters)) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  const { data: txResponse, isLoading } = useTransactions(filters, page, pageSize)

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-bold tracking-tight text-balance mb-4">
        Transactions
      </h1>

      {merchants && countries && providers && payMethods ? (
        <div className="space-y-4">
          <div className="sticky top-0 z-50 bg-background py-2">
            <TransactionsFilterBar
              filters={filters}
              setFilters={handleSetFilters}
              merchants={merchants}
              countries={countries}
              providers={providers}
              payMethods={payMethods}
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <TransactionsTable
              columns={transactionColumns}
              data={txResponse?.data ?? []}
              page={page}
              total={txResponse?.total ?? 0}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          )}
        </div>
      ) : null}
    </>
  )
}
