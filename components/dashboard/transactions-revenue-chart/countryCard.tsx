"use client"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RevenueCountry } from "@/lib/types/transaction"
import {
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react"

function CountryCard({
  country,
  show,
  setShow,
}: {
  country: RevenueCountry
  show: Record<string, boolean>
  setShow: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  const isVisible = show[country.country] ?? false

  const toggleVisibility = () => {
    setShow((prev) => ({
      ...prev,
      [country.country]: !isVisible,
    }))
  }

  return (
    <Card className="min-w-[200px] flex flex-1 gap-1 max-h-[120px]">
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle className="flex gap-2 font-medium text-[14px]">
          {country.country}
        </CardTitle>

        <CardAction>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleVisibility}
                className="cursor-pointer transition-colors hover:text-foreground/80 text-muted-foreground"
              >
                {isVisible ? (
                  <IconEye size={16} />
                ) : (
                  <IconEyeOff size={16} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent className="mb-1">
              <p>{isVisible ? "Click to hide" : "Click to show"}</p>
            </TooltipContent>
          </Tooltip>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div>
          <div className="flex justify-between flex-1">
            <p className="text-xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(country.totalRevenue)}
            </p>
          </div>

          <div className="flex items-center">
            <span className="w-full text-xs text-muted-foreground">
              since last week
            </span>
            <div
              className={`flex text-xs items-center w-fit ${country.lastWeekIncrease === 0
                ? "text-muted-foreground"
                : country.lastWeekIncrease < 0
                  ? "text-red-500"
                  : "text-green-500"
                }`}
            >
              {Math.abs(country.lastWeekIncrease).toFixed(2)}%
              {country.lastWeekIncrease === 0 ? null : country.lastWeekIncrease < 0 ? (
                <IconCaretDownFilled className="scale-80" />
              ) : (
                <IconCaretUpFilled className="scale-80" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CountryCard
