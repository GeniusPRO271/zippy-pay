import { useReports } from "@/hooks/useReports";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Spinner } from "@/components/ui/spinner";
import { IconMoodSad } from "@tabler/icons-react";
import { BaseTransaction } from "@/lib/types/transaction";
import React from "react";
import ReportGeneratorPage from "../reportGeneration";

export default function ReportsTable(
  { transactions, countries, payMethods }: { transactions: BaseTransaction[], countries: string[], payMethods: string[] }
) {
  const { data, isLoading } = useReports()

  const [show, setShow] = React.useState(false)
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
      {!show
        ? <DataTable
          columns={columns}
          data={data}
          setShow={setShow}
        />
        :
        <div className="flex items-center justify-center">
          <ReportGeneratorPage transactions={transactions} setShow={setShow} />
        </div>
      }
    </div>
  )
}

