import { ColumnFiltersState, Table } from "@tanstack/react-table"
import { MultiSelectCombobox } from "../table/filter-dropdown"
import { Button } from "@/components/ui/button"
import { IconX } from "@tabler/icons-react"
import { toOptions } from "@/lib/utils"

interface TableFiltersProps<TData> {
  table: Table<TData>
  columnFilters: ColumnFiltersState,
  countries: string[]
  payMethods: string[]
  providers: string[]
  merchants: string[]
}

function TransactionsChartFilters<TData>(
  { table, countries, columnFilters, payMethods, providers }: TableFiltersProps<TData>) {
  return (
    <div className="flex gap-2 transition-all">
      {/* <MultiSelectCombobox */}
      {/*   table={table} */}
      {/*   columnId="merchantName" */}
      {/*   label="merchantName" */}
      {/*   options={toOptions(["2021juegaloCom-9n3u"])} */}
      {/* /> */}
      <MultiSelectCombobox
        table={table}
        columnId="provider"
        label="Provider"
        options={toOptions(providers)}
      />
      <MultiSelectCombobox
        table={table}
        columnId="payMethod"
        label="Method"
        options={toOptions(payMethods)}
      />
      <MultiSelectCombobox
        table={table}
        columnId="country"
        label="Country"
        options={toOptions(countries)}
      />
      {columnFilters.length > 0 &&
        <Button onClick={() => { table.resetColumnFilters() }} className="text-sm" size={"sm"} variant={"ghost"}>
          Reset
          <IconX size={12} />
        </Button>
      }
    </div>
  )
}

export default TransactionsChartFilters
