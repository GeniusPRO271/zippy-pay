import { Card } from "@/components/ui/card"
import { IconInfoCircle, IconInfoSmall } from "@tabler/icons-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import ProviderDetailsSheet from "./providerDetailsSheet"
import { ProviderDetails } from "@/lib/types/provider"
import { MerchantFullInfo, ProviderInfo } from "@/lib/types/merchant"

function MerchantProviders({ merchant }: { merchant: MerchantFullInfo }) {
  return (
    <Card className="flex flex-col flex-1">
      <div className="flex  flex-col justify-center ">
        <div className="px-5 flex items-center justify-between">
          <h4 className="scroll-m-20 text-normal font-semibold tracking-tight">
            Providers
          </h4>
          <Tooltip>
            <TooltipTrigger asChild>
              <IconInfoCircle size={18} className="text-gray-500" />
            </TooltipTrigger>
            <TooltipContent className="mb-1">
              <p>List of providers assigned</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="mt-5 gap-2 flex flex-col p-2 max-h-[300px] scrollbar-hidden overflow-y-scroll">
          {merchant && merchant.providers.map((provider) => {
            return (
              <ProviderItem key={provider.id} provider={provider} />
            )
          })

          }
        </div>
      </div>
    </Card>
  )
}

interface ProviderItemProps {
  provider: ProviderInfo
}

const ProviderItem: React.FC<ProviderItemProps> = ({
  provider
}) => {
  return (
    <ProviderDetailsSheet providersMerchants={provider} providerID={provider.id}>
      <div className="w-full hover:bg-muted flex justify-center flex-col items-start mp-2 px-3 p-2 rounded-sm hover:cursor-pointer transition">
        <div className="flex gap-2 items-center mb-1">
          <h4 className="scroll-m-20 text-normal font-semibold tracking-tight">
            {provider.name}
          </h4>
        </div>
        <small className="text-muted-foreground text-sm leading-none font-normal">
          {provider.countries.map((c) => c.name).join(", ")}
        </small>
      </div>
    </ProviderDetailsSheet>
  );
};

export default MerchantProviders
