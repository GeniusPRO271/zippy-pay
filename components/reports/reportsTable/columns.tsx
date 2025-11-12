"use client"

import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { IconArrowDown, IconArrowUp, IconDotsVertical } from "@tabler/icons-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { generateGcpLogLink, timestampToDate } from "@/lib/analytics/utils"
import { ReportRecord } from "@/lib/types/reports/reportTable"
import { Spinner } from "@/components/ui/spinner"
import { useDownloadReport } from "@/hooks/useDownloadReport"

export const columns: ColumnDef<ReportRecord>[] = [
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
    accessorKey: "merchantName",
    header: "Merchant",
    cell: ({ row }) => {
      return (
        <div className="w-50 text-ellipsis overflow-hidden">
          {row.original.merchantName}
        </div>
      )
    },
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => (
      <div className="w-50 text-ellipsis overflow-hidden">
        {row.original.country}
      </div>
    ),
  },
  {
    accessorKey: "reportType",
    header: "Report Type",
    cell: ({ row }) => (
      <div className="w-50 text-ellipsis overflow-hidden">
        {row.original.reportType}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status}
      </Badge>
    ),
  },
  {
    enableGlobalFilter: false,
    accessorKey: "createdAt",
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
              Requested at
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
        {format(row.original.createdAt, "dd/MM/yyyy hh:mm")}
      </div>
    )
  },
  {
    enableGlobalFilter: false,
    enableHiding: false,
    id: "actions",
    cell: ({ row }) => {
      const isReady = row.original.status === 'done';
      const reportId = row.original.id;

      const { data: blob, isFetching, refetch } = useDownloadReport(reportId);

      const handleDownload = async () => {
        const { data } = await refetch(); // fetch the blob on click
        if (!data) return;

        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${reportId}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      };

      return (
        <div className="max-w-[91px]">
          {!isReady
            ? <div
              className="flex items-center gap-2"
            >
              <Spinner />
            </div>
            : <Button
              variant={"outline"}
              size={"sm"}
              className="cursor-pointer"
              disabled={!isReady || isFetching}
              onClick={handleDownload}
            >
              {isFetching ?
                <>
                  <Spinner />
                  Downloading…
                </>
                : 'Download'}
            </Button>
          }
        </div>
      )
    },
  }
]
