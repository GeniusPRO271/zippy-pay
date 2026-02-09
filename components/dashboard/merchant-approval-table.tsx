"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState } from "react"
import { MerchantApprovalRate } from "@/lib/types/statistics"

const sampleData: MerchantApprovalRate[] = [
  {
    merchantName: "TechStore Inc",
    approvalRateLast7hrs: 94.2,
    approvalRateLast12hrs: 91.8,
    totalTransactions: 1247,
  },
  {
    merchantName: "Fashion Forward",
    approvalRateLast7hrs: 87.5,
    approvalRateLast12hrs: 85.3,
    totalTransactions: 832,
  },
  {
    merchantName: "Global Gadgets",
    approvalRateLast7hrs: 72.1,
    approvalRateLast12hrs: 78.6,
    totalTransactions: 2103,
  },
  {
    merchantName: "Home Essentials",
    approvalRateLast7hrs: 96.8,
    approvalRateLast12hrs: 95.4,
    totalTransactions: 564,
  },
  {
    merchantName: "Sports Kingdom",
    approvalRateLast7hrs: 45.3,
    approvalRateLast12hrs: 52.7,
    totalTransactions: 1891,
  },
]

function getApprovalRateColor(rate: number) {
  if (rate >= 80) return "text-green-600"
  if (rate >= 50) return "text-yellow-600"
  return "text-red-600"
}

const columns: ColumnDef<MerchantApprovalRate>[] = [
  {
    accessorKey: "merchantName",
    header: "Merchant",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.merchantName}</div>
    ),
  },
  {
    accessorKey: "approvalRateLast7hrs",
    header: "Appv Rate (7h)",
    cell: ({ row }) => {
      const rate = row.original.approvalRateLast7hrs
      return (
        <span className={`font-semibold ${getApprovalRateColor(rate)}`}>
          {rate.toFixed(1)}%
        </span>
      )
    },
  },
  {
    accessorKey: "approvalRateLast12hrs",
    header: "Appv Rate (12h)",
    cell: ({ row }) => {
      const rate = row.original.approvalRateLast12hrs
      return (
        <span className={`font-semibold ${getApprovalRateColor(rate)}`}>
          {rate.toFixed(1)}%
        </span>
      )
    },
  },
  {
    accessorKey: "totalTransactions",
    header: "Num. Transactions",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.totalTransactions.toLocaleString()}
      </div>
    ),
  },
]

export default function MerchantApprovalTable() {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: sampleData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Merchant Approval Rates</CardTitle>
        <CardDescription>
          Approval rate breakdown per merchant over the last 7 and 12 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
