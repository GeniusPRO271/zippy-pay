"use client"

import { Transaction } from "@/types/transaction"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns";
import { DataTableColumnHeader } from "../ui/data-table-column-header";

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
  },
  {
    accessorKey: "merchantId",
    header: "Merchant ID",
    cell: ({ row }) => (
      <div className="cursor-pointer underline font-medium">
        {row.original.merchantId}
      </div>
    ),

  },
  {
    accessorKey: "name",
    header: "Costumer Name",
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "payMethod",
    header: "Payment Method",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <div>
        {format(row.original.createdAt, "dd/MM/yyyy hh:mm")}
      </div>
    )

  },
];
