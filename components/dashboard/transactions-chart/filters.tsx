import { MultiSelectCombobox } from "../table/filter-dropdown"
import { Button } from "@/components/ui/button"
import { IconX } from "@tabler/icons-react"
import { toOptions } from "@/lib/utils"
import { Merchant } from "@/lib/types/merchant"
import { Provider } from "@/lib/types/provider"
import { PayMethod } from "@/lib/types/payMethod"
import { Country } from "@/lib/types/country"
import { StatsFilters } from "@/lib/types/statistics"

interface TableFiltersProps {
  columnFilters: StatsFilters
  setColumnFilters: React.Dispatch<React.SetStateAction<StatsFilters>>
  countries: Country[]
  providers: Provider[]
  merchants: Merchant[]
  payMethods: PayMethod[]
}

function TransactionsChartFilters({
  countries,
  merchants,
  columnFilters,
  setColumnFilters,
  payMethods,
  providers,
}: TableFiltersProps) {
  const hasFilters =
    (columnFilters.payMethodIds?.length || 0) +
    (columnFilters.countryIds?.length || 0) +
    (columnFilters.merchantIds?.length || 0) +
    (columnFilters.providerIds?.length || 0) > 0

  const handleReset = () => {
    setColumnFilters({
      payMethodIds: [],
      merchantIds: [],
      providerIds: [],
      countryIds: [],
    })
  }

  return (
    <div className="flex gap-2 transition-all">
      <MultiSelectCombobox
        label="PayMethod"
        options={toOptions(payMethods, "id", "name")}
        value={columnFilters.payMethodIds || []}
        onChange={(values) =>
          setColumnFilters((prev) => ({ ...prev, payMethodIds: values }))
        }
      />
      <MultiSelectCombobox
        label="Merchant"
        options={toOptions(merchants, "id", "name")}
        value={columnFilters.merchantIds || []}
        onChange={(values) =>
          setColumnFilters((prev) => ({ ...prev, merchantIds: values }))
        }
      />
      <MultiSelectCombobox
        label="Country"
        options={toOptions(countries, "id", "name")}
        value={columnFilters.countryIds || []}
        onChange={(values) =>
          setColumnFilters((prev) => ({ ...prev, countryIds: values }))
        }
      />
      <MultiSelectCombobox
        label="Provider"
        options={toOptions(providers, "id", "name")}
        value={columnFilters.providerIds || []}
        onChange={(values) =>
          setColumnFilters((prev) => ({ ...prev, providerIds: values }))
        }
      />
      {hasFilters && (
        <Button
          onClick={handleReset}
          className="text-sm cursor-pointer"
          size="sm"
          variant="ghost"
        >
          Reset
          <IconX size={12} />
        </Button>
      )}
    </div>
  )
}

export default TransactionsChartFilters
