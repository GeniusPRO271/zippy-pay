import { Transaction } from "@/types/transaction";
import { columns } from "@/components/transactions/columns"
import { DataTable } from "@/components/transactions/data-table"

async function getData(): Promise<Transaction[]> {
  // Fetch data from your API here.
  return [
    {
      id: "1a2b3c4d-0000-0000-0000-000000000001",
      merchantId: "merchant_001",
      transactionId: "txn_001",
      amount: "1200.50",
      currency: "USD",
      country: "EC",
      payMethod: "bankCard",
      documentId: "doc_001",
      email: "alice@example.com",
      name: "Alice Johnson",
      status: "validated",
      message: "Payment successful",
      zippyId: "zippy_001",
      sign: "abc123sign",
      createdAt: new Date("2025-01-01T10:00:00Z"),
      updatedAt: new Date("2025-01-01T10:05:00Z"),
    },
    {
      id: "1a2b3c4d-0000-0000-0000-000000000002",
      merchantId: "merchant_002",
      transactionId: "txn_002",
      amount: "850.00",
      currency: "CLP",
      country: "CL",
      payMethod: "bankTransfer",
      documentId: "doc_002",
      email: "bob@example.com",
      name: "Bob Smith",
      status: "pending",
      message: "Awaiting confirmation",
      zippyId: "zippy_002",
      sign: "def456sign",
      createdAt: new Date("2025-02-15T14:30:00Z"),
      updatedAt: new Date("2025-02-15T14:30:00Z"),
    },
    {
      id: "1a2b3c4d-0000-0000-0000-000000000003",
      merchantId: "merchant_003",
      transactionId: "txn_003",
      amount: "230.75",
      currency: "USD",
      country: "EC",
      payMethod: "cash",
      email: "carol@example.com",
      name: "Carol Lee",
      status: "error",
      message: "Payment declined",
      zippyId: "zippy_003",
      sign: "ghi789sign",
      createdAt: new Date("2025-03-10T09:15:00Z"),
      updatedAt: new Date("2025-03-10T09:20:00Z"),
    },
  ];
}

async function Transactions() {
  const data = await getData()
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <DataTable columns={columns} data={data} />
      </main>
    </div>
  )
}

export default Transactions
