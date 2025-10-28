import { notFound } from "next/navigation";
import MerchantProviders from "@/components/merchants/merchant/mechantProviders";
import MerchantProgressOverview from "@/components/merchants/merchant/merchatProgressOverview";
import ProfileOverview from "@/components/merchants/merchant/profileOverview";
import TransactionHistory from "@/components/merchants/merchant/transactionHistory";
import { getMerchantFullInfo } from "@/actions/merchantActions";

async function MerchantDetail({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const merchant = await getMerchantFullInfo(id);

  if (!merchant) {
    notFound();
  }

  return (
    <div className="p-5 w-full h-full flex flex-col">
      <div className="flex gap-2 w-full flex-1">
        <div className="h-full flex-1">
          <ProfileOverview merchant={merchant} />
        </div>

        <div className="flex-2 gap-2 flex flex-col">
          <div className="flex-1">
            <MerchantProgressOverview />
          </div>

          <div className="flex flex-1 gap-2">
            <div className="flex-1 flex w-full">
              <TransactionHistory />
            </div>

            <div className="flex-1 flex w-full">
              <MerchantProviders merchant={merchant} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantDetail;
