import { useReports } from "@/hooks/useReports";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Spinner } from "@/components/ui/spinner";
import { IconMoodSad } from "@tabler/icons-react";
import React from "react";

export default function ReportsTable() {
  const { data, isLoading } = useReports()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-center flex gap-2 items-center justify-center">
          <Spinner className="size-4" />
          <p className="text-sm text-muted-foreground">Retriving your reports...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-center flex gap-2 items-center justify-center">
          <IconMoodSad />
          <p className="text-sm text-muted-foreground">No Reports Found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto mt-4 ">
      <DataTable
        columns={columns}
        data={data}
      />
    </div>
  )
}

