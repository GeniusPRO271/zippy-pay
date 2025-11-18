import { BaseTransaction } from "@/lib/types/transaction";
import ReportForm from "./reportForm";
import React from "react";

export default function ReportGeneratorPage(
  { transactions, setShow }: { transactions: BaseTransaction[], setShow: React.Dispatch<React.SetStateAction<boolean>> }
) {

  return (
    <div className="p-5 w-full flex justify-center items-center h-[calc(100vh-200px)]">
      <div className="min-w-md flex h-full">
        <ReportForm transactions={transactions} setShow={setShow} />
      </div>
    </div>
  )
}

