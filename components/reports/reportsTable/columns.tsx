"use client"

import { Badge } from "@/components/ui/badge"
import { ColumnDef, Row } from "@tanstack/react-table"
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ReportRecord } from "@/lib/types/reports/reportTable"
import { Spinner } from "@/components/ui/spinner"
import { useDownloadReport } from "@/hooks/useDownloadReport"
import { toast } from "sonner"

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
    header: "Name",
    cell: ({ row }) => {
      const createdAt = new Date(row.original.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      const isNew = diffMinutes < 15;

      return (
        <div className="w-50 text-ellipsis overflow-hidden flex items-center gap-2">
          <span>{row.original.merchantName}</span>

          {isNew && (
            <Badge className="rounded-full px-2 font-mono tabular-nums text-[10px] ">
              New
            </Badge>
          )}
        </div>
      );
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
    sortingFn: (rowA: Row<ReportRecord>, rowB: Row<ReportRecord>): number => {
      const dateA = new Date(rowA.original.createdAt);
      const dateB = new Date(rowB.original.createdAt);

      const timeA = dateA.getTime() || 0;
      const timeB = dateB.getTime() || 0;

      if (timeA === timeB) return 0;
      return timeA > timeB ? 1 : -1;
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
    cell: (props) => <DownloadCell {...props} />
  }
]


const DownloadCell = ({ row }: { row: Row<ReportRecord> }) => {
  const isReady = row.original.status === "done";
  const reportId = row.original.id;

  const { refetch, isEnabled } = useDownloadReport(reportId);

  const handleDownload = () => {
    toast.promise(
      async () => {
        const result = await refetch();

        if (result.error) throw new Error("Download failed");
        if (!result.data) throw new Error("No file received");

        const blobUrl = URL.createObjectURL(result.data);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `report_${reportId}.xlsx`;
        a.click();

        URL.revokeObjectURL(blobUrl);

        return { name: `Report ${reportId}` };
      },
      {
        loading: "Downloading report…",
        success: `Your report has been downloaded`,
        error: "Could not download the report",
      }
    );
  };

  return (
    <div className="max-w-[120px] ">
      {/* Report NOT READY */}
      {!isReady && (
        <Button
          variant="outline"
          size="sm"
          disabled={true}
        >
          <div className="flex items-center gap-2">
            <Spinner />
            Generating...
          </div>
        </Button>
      )}

      {/* Report READY */}
      {isReady && (
        <Button
          className="cursor-pointer"
          variant="outline"
          size="sm"
          disabled={!isEnabled}
          onClick={handleDownload}
        >
          <div className="flex items-center gap-2">
            Download
          </div>
        </Button>
      )}
    </div>
  );
};
