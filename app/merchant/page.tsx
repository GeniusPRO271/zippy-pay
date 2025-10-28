import MerchantsTable from "@/components/merchants/table/table"

function MerchantsPage() {
  return (
    <div className="p-5 w-full h-full flex flex-col">
      <div className="items-center justify-between flex mb-2">
        <h1 className="scroll-m-20 text-center text-2xl font-bold tracking-tight text-balance">
          Merchants
        </h1>
      </div>
      <div className="flex flex-1">
        <MerchantsTable />
      </div>
    </div>
  )
}

export default MerchantsPage
