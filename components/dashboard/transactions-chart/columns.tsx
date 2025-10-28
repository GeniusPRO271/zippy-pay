"use client"

import { ColumnDef } from "@tanstack/react-table"
import { BaseTransaction } from "@/lib/types/transaction"

export const columns: ColumnDef<BaseTransaction>[] = [
  {
    accessorKey: "payMethod",
    header: "Method",
    filterFn: "arrIncludesSome",
    enableGlobalFilter: false,
  },
  {
    accessorKey: "country",
    header: "Country",
    filterFn: "arrIncludesSome",
    enableGlobalFilter: false,
  },
]
