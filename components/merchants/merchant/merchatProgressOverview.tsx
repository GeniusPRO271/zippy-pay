
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { IconActivity, IconAlertCircle, IconClock, IconCode, IconInfoCircle, IconWallet } from "@tabler/icons-react"
import { JSX } from "react"

function MerchantProgressOverview() {
  return (
    <Card className="p-5 flex flex-col h-full">
      <div className="flex flex-col justify-center h-full">
        <div className="flex items-center justify-between">
          <h4 className="scroll-m-20 text-normal font-semibold tracking-tight">
            Merchant Track
          </h4>
          <div className="flex items-center gap-2 ">
            <Button variant={"ghost"} size={"sm"} className="cursor-pointer">
              View more
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <IconInfoCircle size={18} className="text-gray-500" />
              </TooltipTrigger>
              <TooltipContent className="mb-1">
                <p>Latest track / progress</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="mt-5 flex flex-1 relative">
          {/* Vertical bar */}
          <div className="ml-[10px] bg-muted w-[1px] h-full"></div>

          {/* Text on top of the line */}
          <div className="absolute w-full left-0 top-0 flex justify-center h-full">
            <div className="flex flex-col flex-1 w-full justify-between gap-2 h-full">
              <ProgressItem
                icon={<IconCode size={14} />}
                title="Merchant Implementing API"
                date="Started on December 2nd, 2025"
                content="The merchant began integrating the API into their system and started testing the transaction flow."
              />

              <ProgressItem
                icon={<IconAlertCircle size={14} />}
                title="Merchant Encountered a Problem"
                date="December 5th, 2025"
                content="During the API integration, the merchant faced an unexpected issue and required support to resolve it."
              />

              <ProgressItem
                icon={<IconActivity size={14} />}
                title="Merchant Started Providing Flow"
                date="December 10th, 2025"
                content="The merchant successfully resolved the issues and started sending transaction flow data to our system."
              />
            </div>
          </div>
        </div>
      </div>
    </Card >
  )
}

interface ProgressItemProps {
  icon?: JSX.Element;
  title: string;
  date?: string;
  content: string;
}

export function ProgressItem({ icon, title, date, content }: ProgressItemProps) {
  return (
    <div className="flex items-start">
      {icon && (
        <div className="mr-2 bg-muted h-6 w-6 flex justify-center items-center rounded-full">
          {icon}
        </div>
      )}
      <div className="flex flex-col justify-start gap-1 w-full">
        <h4 className="scroll-m-20 text-normal font-semibold tracking-tight">
          {title}
        </h4>
        {date && (
          <small className="flex gap-2 text-muted-foreground text-sm leading-none font-normal">
            <IconClock size={12} /> {date}
          </small>
        )}
        <p className="leading-5 text-sm mt-2">
          {content}
        </p>
      </div>
    </div>
  );
}



export default MerchantProgressOverview
