import {
  IconArrowsExchange,
  IconArrowDownRight,
  IconArrowUpRight,
  IconCash,
} from "@tabler/icons-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "../ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { IconInfoCircle } from "@tabler/icons-react"
import { PaymentBreakdown } from "@/lib/types/statistics"

const usdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

function PaymentBreakdownCards({
  breakdown,
}: {
  breakdown?: PaymentBreakdown
}) {
  const b = breakdown ?? { total: 0, payInTotal: 0, payOutTotal: 0, net: 0 }

  const cards = [
    {
      title: "Total Amount",
      subtitle: "PayIn + PayOut",
      value: b.total,
      icon: IconCash,
    },
    {
      title: "Total PayIn",
      subtitle: "Incoming payments",
      value: b.payInTotal,
      icon: IconArrowDownRight,
    },
    {
      title: "Total PayOut",
      subtitle: "Outgoing payments",
      value: b.payOutTotal,
      icon: IconArrowUpRight,
    },
    {
      title: "Net Amount",
      subtitle: "PayIn - PayOut",
      value: b.net,
      icon: IconArrowsExchange,
    },
  ]

  return (
    <div className="flex gap-4 mt-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="h-[120px] flex-1 gap-2">
            <CardHeader>
              <CardTitle className="flex gap-2 font-medium">
                <Icon size={14} />
                <p className="text-[14px]">{card.title}</p>
              </CardTitle>
              <CardAction>
                <Tooltip>
                  <TooltipTrigger className="cursor-pointer" asChild>
                    <IconInfoCircle size={18} className="text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent className="mb-1">
                    <p>{card.subtitle} (amounts without fees)</p>
                  </TooltipContent>
                </Tooltip>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {usdFormat.format(card.value)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default PaymentBreakdownCards
