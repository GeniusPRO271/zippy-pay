"use client"

import TransactionAnalyticsDashboard from "@/components/dashboard/transactionAnalytics/transaction-analytics-dashboard"
import { useCountries } from "@/hooks/country/useCountries"
import { useProviders } from "@/hooks/provider/useProviders"
import { useMerchants } from "@/hooks/merchant/useMerchants"
import { usePayMethods } from "@/hooks/payMethod/usePayMethod"

export default function TransactionAnalyticsPage() {
  const { data: countries } = useCountries()
  const { data: providers } = useProviders()
  const { data: merchants } = useMerchants()
  const { data: payMethods } = usePayMethods()

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-bold tracking-tight text-balance mb-4">
        Transaction Analytics
      </h1>
      {merchants && countries && providers && payMethods && (
        <TransactionAnalyticsDashboard
          merchants={merchants}
          countries={countries}
          payMethods={payMethods}
          providers={providers}
        />
      )}
    </>
  )
}
