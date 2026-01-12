"use client"
import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RevenueCountry } from "@/lib/types/transaction"
import TransactionChart from "./transactionChart"
import CountryCard from "./countryCard"
import { ArrowUpDown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { IconEye, IconEyeOff } from "@tabler/icons-react"
import { Country } from "@/lib/types/country"
import { ChartConfig, RevenueEntry } from "@/lib/types/statistics"
export const description = "An interactive area chart"


interface DataTableProps {
  data: { data: RevenueEntry[]; config: ChartConfig }
  countries: Country[]
  revenueByCountry: RevenueCountry[]
}

export function AnalyticsCard5({
  data,
  revenueByCountry
}: DataTableProps) {

  const initialFilter = React.useMemo(() => {
    const map: Record<string, boolean> = { total: true }
    revenueByCountry.forEach((c) => {
      map[c.country] = false
    })
    return map
  }, [revenueByCountry])

  const [filter, setFilter] = React.useState<Record<string, boolean>>(initialFilter)
  return (
    <Card className="w-full max-h-[481px] mt-4">
      <CardHeader className="flex justify-between items-start">
        <div>
          <div className="grid flex-1 gap-1">
            <CardTitle>Transactions Revenue </CardTitle>
          </div>
          <CardDescription>Total transactions revenue across all providers</CardDescription>
        </div>
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() =>
                  setFilter((prev) => ({
                    ...prev,
                    total: !prev.total, // toggle total state
                  }))
                }
                className="cursor-pointer transition-colors hover:text-foreground/80 text-muted-foreground"
              >
                <span className="flex items-center gap-2 text-xs">
                  {filter?.total ? (
                    <IconEye size={16} />
                  ) : (
                    <IconEyeOff size={16} />
                  )}
                </span>
              </button>
            </TooltipTrigger>

            <TooltipContent className="mb-1">
              <p>
                {filter?.total
                  ? "Click to hide total revenue"
                  : "Click to show total revenue"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="flex items-start px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="flex-col flex gap-3 text-sm text-muted-foreground">
          <span className="flex justify-start items-center gap-2" >
            Found {revenueByCountry.length} countries revenues {revenueByCountry.length > 2 && <ArrowUpDown size={12} />
            }          </span>
          <div className="flex flex-col gap-3 overflow-y-scroll max-h-[256px] w-[250px] scrollbar-hidden">
            {revenueByCountry.map(country => {
              return (
                <CountryCard show={filter} setShow={setFilter} key={country.country} country={country} />
              )
            })}
          </div>

        </div>

        <div className="flex-5">
          <TransactionChart
            filter={filter}
            transactionsByDay={data.data}
            config={data.config}
          />
        </div>

      </CardContent>
    </Card>
  )
}

