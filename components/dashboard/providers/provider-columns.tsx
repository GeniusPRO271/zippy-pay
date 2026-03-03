"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconDotsVertical } from "@tabler/icons-react"
import { Provider } from "@/lib/types/provider"
import { format } from "date-fns"

const STATUS_VARIANT: Record<Provider["status"], "default" | "destructive" | "outline"> = {
  active: "default",
  inactive: "outline",
  maintenance: "outline",
}

const STATUS_CLASS: Record<Provider["status"], string> = {
  active: "bg-emerald-600 text-white hover:bg-emerald-600",
  inactive: "border-yellow-500 text-yellow-600",
  maintenance: "border-orange-500 text-orange-600",
}

const CATEGORY_CLASS: Record<Provider["category"], string> = {
  PSP: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  BANK: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  AGGREGATOR: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  WALLET: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  CRYPTO_GATEWAY: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
}

function formatDate(date: Date | string | null): string {
  if (!date) return "—"
  try {
    return format(new Date(date), "dd/MM/yyyy")
  } catch {
    return "—"
  }
}

export function createProviderColumns(
  onViewDetails: (provider: Provider) => void
): ColumnDef<Provider>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline" className={CATEGORY_CLASS[row.original.category]}>
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "headquartersCountry",
      header: "HQ Country",
      cell: ({ row }) => row.original.headquartersCountry ?? "—",
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
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => row.original.priority ?? "—",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      enableGlobalFilter: false,
      enableHiding: false,
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
            <DropdownMenuItem
              onSelect={() => onViewDetails(row.original)}
            >
              Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
