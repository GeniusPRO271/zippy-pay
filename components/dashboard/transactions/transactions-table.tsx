"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconAdjustmentsHorizontal, IconDownload } from "@tabler/icons-react"
import { Transaction } from "@/lib/types/transactions"
import { format } from "date-fns"

function exportToCSV(data: Transaction[], filename: string) {
  const headers = [
    "Method",
    "Status",
    "Merchant",
    "Provider",
    "Country",
    "Request Date",
    "Transfer Date",
    "Name",
    "Email",
    "ID Document",
    "Amount (local currency)",
    "Zippy ID",
    "Merchant Internal ID",
  ]

  const rows = data.map((t) => [
    t.method,
    t.status,
    t.merchant,
    t.provider,
    t.country,
    t.requestDate ? format(new Date(t.requestDate), "dd/MM/yyyy HH:mm") : "",
    t.transferDate ? format(new Date(t.transferDate), "dd/MM/yyyy HH:mm") : "",
    t.name,
    t.email,
    t.idDocument,
    `${t.amount} ${t.currency}`,
    t.zippyId,
    t.commerceReqId,
  ])

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n")

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

interface TransactionsTableProps {
  columns: ColumnDef<Transaction, unknown>[]
  data: Transaction[]
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function TransactionsTable({ columns, data, page, total, pageSize, onPageChange }: TransactionsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const totalPages = Math.ceil(total / pageSize)

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  })

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="mb-3 flex gap-2">
        <div className="flex items-center justify-between flex-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              exportToCSV(
                data,
                `transactions_${format(new Date(), "yyyy-MM-dd_HHmm")}.csv`
              )
            }
          >
            <IconDownload size={16} />
            Export CSV
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="ml-auto">
                <IconAdjustmentsHorizontal size={16} />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <p className="text-sm font-semibold p-1">Toggle columns</p>
              <Separator className="my-2" />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="text-muted-foreground text-sm">
          {total > 0
            ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total.toLocaleString()} transactions`
            : "No transactions"}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
