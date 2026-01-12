import { useReports } from "@/hooks/useReports";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Spinner } from "@/components/ui/spinner";
import { IconMoodSad } from "@tabler/icons-react";
import { BaseTransaction } from "@/lib/types/transaction";
import React from "react";
import ReportGeneratorPage from "../reportGeneration";
import { Country } from "@/lib/types/country";
import { PayMethod } from "@/lib/types/payMethod";

export default function ReportsTable(
  { countries, payMethods }: { countries: Country[], payMethods: PayMethod[] }
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
          <ReportGeneratorPage setShow={setShow} />
        </div>
      }
    </div>
  )
}

