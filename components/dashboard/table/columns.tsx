"use client"

import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { IconArrowDown, IconArrowUp, IconDotsVertical } from "@tabler/icons-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import StatusBadge from "./statusBadge"
import { format } from "date-fns"
import { BaseTransaction } from "@/lib/types/transaction"
import { generateGcpLogLink, timestampToDate } from "@/lib/analytics/utils"
import DetailSheet from "../detail-sheet"
import { STATUS_CONFIG } from "./statusConfig"

export const columns: ColumnDef<BaseTransaction>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return (
        <div className="w-50 text-ellipsis overflow-hidden">
          {row.original.id}
        </div>
      )
    },
  },
  {
    accessorKey: "commerceReqId",
    header: "Commerce Id",
    cell: ({ row }) => {
      return (
        <div className="w-50 text-ellipsis overflow-hidden">
          {row.original.commerceReqId}
        </div>
      )
    },
  },
  {
    accessorKey: "customer",
    header: "Costumer",
    cell: ({ row }) => (
      <div className="w-50 text-ellipsis overflow-hidden">
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="w-50 text-ellipsis overflow-hidden">
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="w-10">
        {row.original.quantity}
      </div>
    ),
    enableGlobalFilter: false,
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.currency}
      </Badge>
    ),
    enableGlobalFilter: false,

  },
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
  {
    accessorKey: "status",
    header: "Status",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => (
      <StatusBadge status={row.original.status} statusConfig={STATUS_CONFIG} />
    ),
    enableGlobalFilter: false,
    enableColumnFilter: true

  },
  {
    enableGlobalFilter: false,
    accessorKey: "dateRequest",
    enableHiding: false,
    enableSorting: true,
    sortingFn: (rowA: any, rowB: any, columnId: string) => {
      const dateA = timestampToDate(rowA.original[columnId])
      const dateB = timestampToDate(rowB.original[columnId])

      const timeA = dateA?.getTime?.() ?? 0
      const timeB = dateB?.getTime?.() ?? 0

      return timeA === timeB ? 0 : timeA > timeB ? 1 : -1
    },
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 px-2"
            >
              Requested At
              {isSorted === "asc" && (
                <IconArrowUp className="text-xs" />
              )}
              {isSorted === "desc" && (
                <IconArrowDown size={5} />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => column.toggleSorting(false)}
            >
              <span className="text-sm flex items-center gap-1">
                <IconArrowUp size={12} /> Asc
              </span>

            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => column.toggleSorting(true)}
            >
              <span className="text-sm flex items-center gap-1">
                <IconArrowDown size={12} /> Desc
              </span>

            </DropdownMenuItem>
            {isSorted && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => column.clearSorting()}
                >
                  Clear Sort
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    cell: ({ row }) => (
      <div>
        {format(timestampToDate(row.original.dateRequest), "dd/MM/yyyy hh:mm")}
      </div>
    )
  },
  {
    enableGlobalFilter: false,
    enableHiding: false,
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Copy ID</DropdownMenuItem>
          <DetailSheet data={row.original}>
            <DropdownMenuItem onSelect={(e) => {
              e.preventDefault();
            }} >
              Details
            </DropdownMenuItem>
          </DetailSheet>
          <DropdownMenuItem
            onClick={() => window.open(generateGcpLogLink(row.original.id), "_blank")}
          >
            Check Logs
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu >
    ),
  },
]
