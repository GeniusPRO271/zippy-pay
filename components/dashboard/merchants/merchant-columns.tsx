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
import { Merchant } from "@/lib/types/merchant"
import { format } from "date-fns"

const STATUS_VARIANT: Record<Merchant["status"], "default" | "destructive" | "outline"> = {
  active: "default",
  inactive: "outline",
  suspended: "destructive",
}

const STATUS_CLASS: Record<Merchant["status"], string> = {
  active: "bg-emerald-600 text-white hover:bg-emerald-600",
  inactive: "border-yellow-500 text-yellow-600",
  suspended: "",
}

function formatDate(date: Date | string | null): string {
  if (!date) return "—"
  try {
    return format(new Date(date), "dd/MM/yyyy")
  } catch {
    return "—"
  }
}

export function createMerchantColumns(
  onViewDetails: (merchant: Merchant) => void
): ColumnDef<Merchant>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email ?? "—",
    },
    {
      accessorKey: "contactPerson",
      header: "Contact Person",
      cell: ({ row }) => row.original.contactPerson ?? "—",
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
