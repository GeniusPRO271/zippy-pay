"use client"

import { ColumnDef } from "@tanstack/react-table"
import { BaseTransaction } from "@/lib/types/transaction"

export const columns: ColumnDef<BaseTransaction>[] = [
  {
    accessorKey: "merchantName",
    header: "merchantName",
    filterFn: "arrIncludesSome",
    enableGlobalFilter: false,
  },
  {
    accessorKey: "payMethod",
    header: "Method",
    filterFn: "arrIncludesSome",
    enableGlobalFilter: false,
  },
  {
    accessorKey: "provider",
    header: "Provider",
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
