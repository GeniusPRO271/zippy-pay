"use client"

import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { BaseTransaction } from "@/lib/types/transaction"

export const columns: ColumnDef<BaseTransaction>[] = [
  {
    accessorKey: "payMethod",
    header: "Method",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.payMethod}
      </Badge>
    ),
    enableGlobalFilter: false,
  },
  {
    accessorKey: "country",
    header: "Country",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.country}
      </Badge>
    ),
    enableGlobalFilter: false,
  },
]
