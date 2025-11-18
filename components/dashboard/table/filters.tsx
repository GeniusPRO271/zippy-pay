import { Input } from "@/components/ui/input"
import { ColumnFiltersState, Table } from "@tanstack/react-table"
import { MultiSelectCombobox } from "./filter-dropdown"
import { Button } from "@/components/ui/button"
import { IconX } from "@tabler/icons-react"

interface TableFiltersProps<TData> {
  table: Table<TData>
  globalFilter: string[],
  columnFilters: ColumnFiltersState,
  countries: string[]
  payMethods: string[]
}

function TableFilters<TData>(
  { table, globalFilter, columnFilters }: TableFiltersProps<TData>) {
  return (
    <div className="flex gap-2 w-full">
      <Input
        placeholder="Filter zippyID or commerceReqId"
        value={globalFilter}
        onChange={(event) => {
          const value = event.target.value
          console.log("[DEVUG] FILTER VALUE: ", value)
          table.setGlobalFilter(value)
        }}
        className="max-w-sm h-8 font-sm"
      />
      <MultiSelectCombobox
        table={table}
        columnId="status"
        label="Status"
        options={[
          { value: "ok", label: "OK" },
          { value: "pending", label: "Pending" },
          { value: "error", label: "Error" },
        ]}
      />
      {/* <MultiSelectCombobox */}
      {/*   table={table} */}
      {/*   columnId="payMethod" */}
      {/*   label="Method" */}
      {/*   options={toOptions(payMethods)} */}
      {/* /> */}
      {/* <MultiSelectCombobox */}
      {/*   table={table} */}
      {/*   columnId="country" */}
      {/*   label="Country" */}
      {/*   options={toOptions(countries)} */}
      {/* /> */}
      {columnFilters.length > 0 &&
        <Button onClick={() => { table.resetColumnFilters() }} className="text-sm" size={"sm"} variant={"ghost"}>
          Reset
          <IconX size={12} />
        </Button>
      }
    </div>
  )
}

export default TableFilters
