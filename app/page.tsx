"use client"
import * as React from "react"
import {
  IconBolt,
  IconReport,
} from "@tabler/icons-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PageDashoard from "./dashboard/dashboard"
import { useCountries } from "@/hooks/country/useCountries"
import { useProviders } from "@/hooks/provider/useProviders"
import { useMerchants } from "@/hooks/merchant/useMerchants"
import { usePayMethods } from "@/hooks/payMethod/usePayMethod"
import ReportsTable from "@/components/reports/reportsTable"
import { LogoutButton } from "@/components/ui/logOutButton"

export function Page() {
  const { data: countries } = useCountries()
  const { data: providers } = useProviders()
  const { data: merchants } = useMerchants()
  const { data: payMethods } = usePayMethods()

  return (
    <>
      <div className="p-5 w-full h-full">
        <div className="items-center justify-between flex mb-2">
          <h1 className="scroll-m-20 text-center text-2xl font-bold tracking-tight text-balance">
            Dashboard
          </h1>
          <LogoutButton />
        </div>

        <Tabs defaultValue="dashboard" className="w-full h-full">
          <TabsList>
            <TabsTrigger value="dashboard">
              <IconBolt className="mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports" disabled>
              <IconReport className="mr-1" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-4" value="dashboard">
            {
              merchants && countries && providers && payMethods &&
              <PageDashoard
                merchants={merchants}
                countries={countries}
                payMethods={payMethods}
                providers={providers}
              />
            }
          </TabsContent>

          <TabsContent value="analytics">Analytics content here.</TabsContent>
          <TabsContent value="reports">
            {
              merchants && countries && providers && payMethods &&
              <div className="flex justify-center items-center">
                <ReportsTable countries={countries} payMethods={payMethods} />
              </div>
            }
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default Page
