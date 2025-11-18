"use client"
import { DataTable } from "./data-table"
import { BaseTransaction } from "@/lib/types/transaction"
import { getColumns } from "./columns"

export default function ReportGeneratorTransactionTable(
  { transactions,
    // countries,
    // payMethods
  }: {
    transactions: BaseTransaction[],
    // countries: string[],
    // payMethods: string[]
  }
) {

  const deleteRow = (tx: BaseTransaction) => {
    transactions.filter(item => item.commerceReqId !== tx.commerceReqId)
  }

  return (
    <div className="w-full h-full">
      <DataTable
        columns={getColumns(deleteRow)}
        data={transactions}
      />
    </div>
  )
}
