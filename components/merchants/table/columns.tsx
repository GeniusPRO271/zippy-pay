"use client"

import { ColumnDef } from "@tanstack/react-table"
import { IconDotsVertical, IconPokerChip } from "@tabler/icons-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Merchant, MerchantWithCountry } from "@/lib/types/merchant"
import StatusBadge from "@/components/dashboard/table/statusBadge"
import { STATUS_CONFIG } from "./statusConfig"
import { useRouter } from "next/navigation";
import { MerchantBasic } from "@/lib/types/merchat/getMerchants"
import { useDownloadReport } from "@/hooks/useDownloadReport"

export const columns: ColumnDef<MerchantBasic>[] = [
  // {
  //   enableGlobalFilter: false,
  //   id: "select",
  //   header: ({ table }) => (
  //     <div className="flex items-center justify-center">
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && "indeterminate")
  //         }
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="flex items-center justify-center">
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: "id",
  //   header: "System ID",
  //   cell: ({ row }) => {
  //     return (
  //       <div className="w-50 text-ellipsis overflow-hidden">
  //         {row.original.id}
  //       </div>
  //     )
  //   },
  // },
  {
    accessorKey: "name",
    header: () => {
      return (
        <div className="w-[200px] pl-4">Name</div>
      )
    },
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <div className="w-50 text-ellipsis overflow-hidden">
          <Button variant="link" className="underline cursor-pointer" onClick={() => { router.push(`/merchant/${row.original.id}`); }} >
            {row.original.name}
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-ellipsis overflow-hidden">
        {row.original.email}
      </div>
    ),
  },

  {
    accessorKey: "country",
    header: "Country of Registration",
    cell: ({ row }) => {
      return (
        <div className="text-ellipsis overflow-hidden">
          {row.original.registeredCountry.name}
        </div>
      )
    },
  },
  // {
  //   enableGlobalFilter: false,
  //   accessorKey: "date",
  //   enableHiding: false,
  //   header: "Registration Date",
  //   cell: ({ row }) => (
  //     <div>
  //       {format(row.original.businessType, "dd MMM, yyyy ")}
  //     </div>
  //   )
  //
  // },
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
    accessorKey: "businessType",
    header: "Business Type",
    cell: ({ row }) => (
      <div className="w-50 flex items-center gap-1 text-ellipsis overflow-hidden">
        <IconPokerChip size={18} /> {row.original.businessType}
      </div>
    ),
  },

  {
    enableGlobalFilter: false,
    enableHiding: false,
    id: "actions",
    cell: ({ row }) => {
      const router = useRouter();

      return (
        < DropdownMenu >
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
            <DropdownMenuItem onClick={() => { router.push(`/merchant/${row.original.id}`); }}>Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu >
      )
    },
  },
]
