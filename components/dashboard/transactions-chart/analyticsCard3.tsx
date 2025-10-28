"use client"
import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DailyTransactionSummary } from "@/lib/types/transaction"
import TransactionChart from "./transactionChart"
export const description = "An interactive area chart"


interface DataTableProps {
  data: DailyTransactionSummary[]
}

export function AnalyticsCard3({
  data,
}: DataTableProps) {

  return (
    <Card className="w-full max-h-[381px]">
      <CardHeader className="flex justify-between items-center">
        <div>
          <div className="grid flex-1 gap-1">
            <CardTitle>Transaction Activity - Month</CardTitle>
          </div>
          <CardDescription>Total transactions across all providers</CardDescription>
        </div>
      </CardHeader>
      <CardContent className=" px-2 pt-4 sm:px-6 sm:pt-6">
        <TransactionChart
          transactionsByDay={data}
        />

      </CardContent>
    </Card>
  )
}

export default AnalyticsCard3
