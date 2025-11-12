import { getAllMerchantsBasic } from "@/actions/merchant/getMerchatsAction";
import { columns } from "./columns"
import { DataTable } from "./data-table";
import { MerchantBasic } from "@/lib/types/merchat/getMerchants";

export default async function MerchantsTable() {
  const data = await getAllMerchantsBasic() as MerchantBasic[];

  return (
    <DataTable
      columns={columns}
      data={data}
    />
  )
}
