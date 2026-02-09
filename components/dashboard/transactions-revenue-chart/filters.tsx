"use client"
import { ColumnFiltersState, Table } from "@tanstack/react-table"
import { MultiSelectCombobox } from "../table/filter-dropdown"
import { Button } from "@/components/ui/button"
import { IconX } from "@tabler/icons-react"
import { toOptions } from "@/lib/utils"
import { PayMethod } from "@/lib/types/payMethod"
import { Country } from "@/lib/types/country"

interface TableFiltersProps<TData> {
  table: Table<TData>
  columnFilters: ColumnFiltersState,
  countries: Country[]
  payMethods: PayMethod[]
}

function TransactionsChartFilters<TData>(
  { table, countries, columnFilters, payMethods }: TableFiltersProps<TData>) {
  return (
    <div className="flex gap-2 transition-all">
      <MultiSelectCombobox
        label="Method"
        options={toOptions(payMethods, "id", "name")}
      />
      <MultiSelectCombobox
        label="Country"
        options={toOptions(countries, "id", "name")}
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
