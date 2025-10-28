import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MerchantFullInfo } from "@/lib/types/merchant"
import { IconBrandTelegram, IconBuilding, IconLink, IconMail } from "@tabler/icons-react"

function ProfileOverview({ merchant }: { merchant: MerchantFullInfo }) {
  return (
    <Card className="p-5 flex flex-col h-full">
      <div className="flex  flex-col justify-center items-center">
        <div className="mb-5 rounded-3xl dark:bg-blue-600 bg-blue-200 h-20 w-20 flex justify-center items-center">
          <IconBuilding size={40} />
        </div>
        <div className="flex gap-2 justify-center items-center">
          <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight">
            {merchant.name}
          </h3>
          <Badge className="dark:bg-green-100 dark:border-green-300 border-green-500 bg-green-400">New</Badge>
        </div>
        <small className="text-muted-foreground text-sm leading-none font-normal">
          {merchant.businessType} based in {merchant.country?.name}
        </small>
      </div>
      <div className="justify-center items-center flex h-20">
        <div className="border h-full flex-1 flex justify-between rounded-xl ">
          <div className="flex flex-col gap-1 flex-1 justify-center items-center h-full">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              14
            </h4>
            <small className="text-muted-foreground text-xs leading-none font-normal">Members</small>
          </div>
          <Separator orientation="vertical" />
          <div className="flex flex-col gap-1 flex-1 justify-center items-center h-full">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              3293
            </h4>
            <small className="text-muted-foreground text-xs leading-none font-normal">Transaction</small>
          </div>
          <Separator orientation="vertical" />
          <div className="flex flex-col gap-1 flex-1 justify-center items-center h-full">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              14.8K
            </h4>
            <small className="text-muted-foreground text-xs leading-none font-normal">Revenue</small>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 justify-end flex-1">
        <div className="flex justify-start items-center gap-2">
          <IconMail className="text-muted-foreground" size={18} />
          <small className="text-muted-foreground text-sm leading-none font-normal">
            {merchant.email}
          </small>
        </div>
      </div>
    </Card>
  )
}

export default ProfileOverview
