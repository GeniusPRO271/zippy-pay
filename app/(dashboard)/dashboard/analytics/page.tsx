"use client"

import PageDashoard from "@/app/dashboard/dashboard"
import { useCountries } from "@/hooks/country/useCountries"
import { useProviders } from "@/hooks/provider/useProviders"
import { useMerchants } from "@/hooks/merchant/useMerchants"
import { usePayMethods } from "@/hooks/payMethod/usePayMethod"

export default function AnalyticsPage() {
  const { data: countries } = useCountries()
  const { data: providers } = useProviders()
  const { data: merchants } = useMerchants()
  const { data: payMethods } = usePayMethods()

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-bold tracking-tight text-balance mb-4">
        Analytics Dashboard
      </h1>
      {merchants && countries && providers && payMethods && (
        <PageDashoard
          merchants={merchants}
          countries={countries}
          payMethods={payMethods}
          providers={providers}
        />
      )}
    </>
  )
}
