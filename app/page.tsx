"use client"
import * as React from "react"
import { BaseTransaction } from "@/lib/types/transaction"
import { DateRange } from "react-day-picker"
import {
  IconBolt,
  IconReport,
} from "@tabler/icons-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { columns } from "@/components/dashboard/transactions-chart/columns"
import { convertTransactionsToCurrency, getTransactionDateRange } from "@/lib/analytics/utils"
import { Spinner } from "@/components/ui/spinner"
import ReportsTable from "@/components/reports/reportsTable"
import PageDashoard from "./dashboard/dashboard"
import { EmptyState } from "./dashboard/empty-state"

export function Page() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [filters, setFilters] = React.useState<{
    dateRange?: DateRange
    dateRangeTrx: DateRange
  }>({
    dateRangeTrx: {
      from: new Date(2025, 5, 9),
      to: new Date(2025, 5, 26),
    },
  })

  const [transactions, setTransactions] = React.useState<BaseTransaction[]>([])
  const transactionsUSD = React.useMemo(
    () => {
      if (transactions.length === 0) return []
      return convertTransactionsToCurrency(transactions, "USD")
    },
    [transactions]
  )

  const countries = React.useMemo(
    () => {
      if (transactions.length === 0) return []
      return Array.from(new Set(transactions.map((t) => t.country).filter(Boolean)))
    },
    [transactions]
  )

  const providers = React.useMemo(
    () => {
      if (transactions.length === 0) return []
      return Array.from(new Set(transactions.map((t) => t.provider).filter(Boolean)))
    },
    [transactions]
  )

  const merchantNames = React.useMemo(
    () => {
      if (transactions.length === 0) return []
      return Array.from(new Set(transactions.map((t) => t.merchantName).filter(Boolean)))
    },
    [transactions]
  )

  const payMethods = React.useMemo(
    () => {
      if (transactions.length === 0) return []
      return Array.from(new Set(transactions.map((t) => t.payMethod).filter(Boolean)))
    },
    [transactions]
  )

  React.useEffect(() => {
    if (transactions.length === 0) return

    const timeoutId = setTimeout(() => {
      const { from, to } = getTransactionDateRange(transactions)
      if (from && to) {
        setFilters((prev) => {
          if (prev.dateRangeTrx.from?.getTime() !== from.getTime() ||
            prev.dateRangeTrx.to?.getTime() !== to.getTime()) {
            return { ...prev, dateRangeTrx: { from, to } }
          }
          return prev
        })
      }
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [transactions])

  const setQuickRange = React.useCallback((range: "7days" | "30days" | "3months") => {
    const now = new Date()
    const from = new Date()
    if (range === "7days") from.setDate(now.getDate() - 7)
    else if (range === "30days") from.setDate(now.getDate() - 30)
    else if (range === "3months") from.setMonth(now.getMonth() - 3)
    setFilters((prev) => ({ ...prev, dateRange: { from, to: now } }))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-center flex gap-2 items-center justify-center">
          <Spinner className="size-4" />
          <p className="text-sm text-muted-foreground">Processing transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {
        (!transactions || transactions.length === 0) ? (
          <div className="flex flex-col justify-center items-center h-full">
            <EmptyState
              setTransactionsAction={setTransactions}
              setIsLoadingAction={setIsLoading}
            />
          </div>
        ) : (
          <div className="p-5 w-full h-full">
            <div className="items-center justify-between flex mb-2">
              <h1 className="scroll-m-20 text-center text-2xl font-bold tracking-tight text-balance">
                Dashboard
              </h1>

              {/* <div className="flex gap-2"> */}
              {/*   <RangePickerButton filters={filters} setFilters={setFilters} /> */}
              {/*   <DropdownMenu> */}
              {/*     <DropdownMenuTrigger asChild> */}
              {/*       <Button variant="outline"> */}
              {/*         <IconCalendar className="h-4 w-4 mr-2" /> */}
              {/*         Quick Range */}
              {/*       </Button> */}
              {/*     </DropdownMenuTrigger> */}
              {/*     <DropdownMenuContent align="end"> */}
              {/*       <DropdownMenuItem onClick={() => setQuickRange("7days")}> */}
              {/*         Last 7 Days */}
              {/*       </DropdownMenuItem> */}
              {/*       <DropdownMenuItem onClick={() => setQuickRange("30days")}> */}
              {/*         Last 30 Days */}
              {/*       </DropdownMenuItem> */}
              {/*       <DropdownMenuItem onClick={() => setQuickRange("3months")}> */}
              {/*         Last 3 Months */}
              {/*       </DropdownMenuItem> */}
              {/*     </DropdownMenuContent> */}
              {/*   </DropdownMenu> */}
              {/* </div> */}
            </div>

            <Tabs defaultValue="dashboard" className="w-full h-full">
              <TabsList>
                <TabsTrigger value="dashboard">
                  <IconBolt className="mr-1" />
                  Dashboard
                </TabsTrigger>
                {/* <TabsTrigger value="analytics"> */}
                {/*   <IconAnalyze className="mr-1" /> */}
                {/*   Analytics */}
                {/* </TabsTrigger> */}
                <TabsTrigger value="reports">
                  <IconReport className="mr-1" />
                  Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent className="space-y-4" value="dashboard">
                <PageDashoard
                  merchants={merchantNames}
                  data={transactionsUSD}
                  columns={columns}
                  countries={countries}
                  payMethods={payMethods}
                  dateRange={filters.dateRange}
                  dateRangeTrx={filters.dateRangeTrx}
                  providers={providers}
                />
              </TabsContent>

              <TabsContent value="analytics">Analytics content here.</TabsContent>
              <TabsContent value="reports">
                <div className="flex justify-center items-center">
                  <ReportsTable transactions={transactions} countries={countries} payMethods={payMethods} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )
      }
    </>
  )
}

export default Page
