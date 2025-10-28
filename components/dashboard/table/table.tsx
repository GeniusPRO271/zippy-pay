"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { BaseTransaction } from "@/lib/types/transaction"

export default function DashbaordTable(
  { transactions, countries, payMethods }: { transactions: BaseTransaction[], countries: string[], payMethods: string[] }
) {

  return (
    <div className="w-full mx-auto mt-4 ">
      <DataTable
        columns={columns}
        data={transactions}
        countries={countries}
        payMethods={payMethods}
      />
    </div>
  )
}
