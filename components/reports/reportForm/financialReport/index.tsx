import { CarouselApi, CarouselItem } from "@/components/ui/carousel";
import ReportFormStep1, { getMerchantName } from "./steps/step1";
import ReportFormStep2 from "./steps/step2";
import ReportFormStep3 from "./steps/step3";
import z from "zod";
import { Step1Schema, Step2Schema } from "@/lib/zod/reportForm";
import { BaseTransaction } from "@/lib/types/transaction";
import { CountryProviders } from "@/lib/types/providers/getProvidersByCountry";
import React from "react";
import { extractCountryProviders } from "@/lib/analytics/utils";

interface FinancialReportStepsProps {
  api: CarouselApi;
  reportType: "financial" | "resume";
  transactions: BaseTransaction[];
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  merchantsNames: string[]
}


export default function FinancialReportSteps({ api, reportType, transactions, setShow, merchantsNames }: FinancialReportStepsProps) {

  const [step1, setStep1] = React.useState<z.infer<typeof Step1Schema>>()
  const [step2, setStep2] = React.useState<z.infer<typeof Step2Schema>>()

  const from = new Date("2025-09-29T09:00:00Z")
  const to = new Date("2025-10-22T13:00:00Z")

  const providersByCountry: CountryProviders[] = React.useMemo(() => {
    return extractCountryProviders(transactions, from, to)
  }, [])

  const filteredTransactions = step1?.merchantName
    ? transactions.filter(t => getMerchantName(t.merchantName) === step1.merchantName)
    : transactions

  console.log('filteredTransactions: ', filteredTransactions.length)
  console.log('filteredTransactions: ', step1?.merchantName)
  return (
    <>
      <CarouselItem>
        <div className="p-1" >
          <ReportFormStep1 api={api} setFormData={setStep1} providers={providersByCountry} merchantsNames={merchantsNames} />
        </div>
      </CarouselItem>
      <CarouselItem>
        <div className="p-1" >
          {step1 && step1.providers &&
            <ReportFormStep2 providers={step1.providers} api={api} setFormData={setStep2} />
          }
        </div>
      </CarouselItem>
      <CarouselItem>
        <div className="p-1" >
          {step1 && step2 &&
            <ReportFormStep3 api={api} step1={step1} step2={step2} transactions={filteredTransactions} setShow={setShow} />
          }
        </div>
      </CarouselItem>
    </>
  )
}

