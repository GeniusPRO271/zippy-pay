import { getMerchants } from "@/actions/merchantActions";
import { columns } from "./columns"
import { DataTable } from "./data-table";

export default async function MerchantsTable() {
  const data = await getMerchants();

  return (
    <DataTable
      columns={columns}
      data={data}
    />
  )
}
