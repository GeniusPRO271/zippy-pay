"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Transaction, TransactionStatus } from "@/lib/types/transactions"

const STATUS_VARIANT: Record<TransactionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  pending: "outline",
  failed: "destructive",
  expired: "secondary",
  refunded: "secondary",
}

const STATUS_CLASS: Record<TransactionStatus, string> = {
  approved: "bg-emerald-600 text-white hover:bg-emerald-600",
  pending: "border-yellow-500 text-yellow-600",
  failed: "",
  expired: "bg-muted text-muted-foreground",
  refunded: "bg-blue-100 text-blue-700 border-blue-200",
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  try {
    return format(new Date(dateStr), "dd/MM/yyyy HH:mm")
  } catch {
    return dateStr
  }
}

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.method}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge
          variant={STATUS_VARIANT[status]}
          className={STATUS_CLASS[status]}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "merchant",
    header: "Merchant",
  },
  {
    accessorKey: "provider",
    header: "Provider",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "requestDate",
    header: "Request Date",
    cell: ({ row }) => formatDate(row.original.requestDate),
  },
  {
    accessorKey: "transferDate",
    header: "Transfer Date",
    cell: ({ row }) => formatDate(row.original.transferDate),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "idDocument",
    header: "ID Document",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatAmount(row.original.amount, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "zippyId",
    header: "Zippy ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.zippyId}</span>
    ),
  },
  {
    accessorKey: "commerceReqId",
    header: "Merchant Internal ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.commerceReqId}</span>
    ),
  },
]
