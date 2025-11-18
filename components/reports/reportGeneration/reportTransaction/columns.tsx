"use client"

import { Badge } from "@/components/ui/badge"
import { ColumnDef, Row } from "@tanstack/react-table"
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { BaseTransaction } from "@/lib/types/transaction"
import { timestampToDate } from "@/lib/analytics/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Trash } from "lucide-react"
import StatusBadge from "@/components/dashboard/table/statusBadge"
import { STATUS_CONFIG } from "@/components/dashboard/table/statusConfig"

export const getColumns = (
  deleteTransaction: (tx: BaseTransaction) => void
): ColumnDef<BaseTransaction>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
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
      accessorKey: "merchantName",
      header: "Merchant Name",
      cell: ({ row }) => (
        <div className="w-50 text-ellipsis overflow-hidden">
          {row.original.merchantName}
        </div>
      ),
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
      accessorKey: "provider",
      header: "Provider",
      cell: ({ row }) => (
        <div className="text-ellipsis overflow-hidden">
          {row.original.provider}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="">
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
      enableGlobalFilter: false,
      accessorKey: "dateRequest",
      enableHiding: false,
      enableSorting: true,
      sortingFn: (rowA: Row<BaseTransaction>, rowB: Row<BaseTransaction>) => {
        const dateA = timestampToDate(rowA.original.dateRequest)
        const dateB = timestampToDate(rowB.original.dateRequest)

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
          {format(timestampToDate(row.original.dateRequest), "dd/MM/yyyy HH:mm")}
        </div>
      )
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600"
                disabled={true}
                onClick={() => deleteTransaction(payment)}
              >
                <Trash size={16} />
                Delete row
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
