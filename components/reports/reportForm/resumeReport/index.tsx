import { CarouselApi, CarouselItem } from "@/components/ui/carousel";
import z from "zod";
import { BaseTransaction } from "@/lib/types/transaction";
import React from "react";
import ReportResumeFormStep1 from "./steps/step1";
import { ReportResumeSchema, ReportResumeType } from "@/lib/zod/reportResumeForm";
import ReportResumeFormStep2 from "./steps/step2";

interface FinancialReportStepsProps {
  api: CarouselApi;
  reportType: "financial" | "resume";
  transactions: BaseTransaction[];
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  merchantsNames: string[]
}


export default function ResumeReportSteps({ api, setShow, transactions }: FinancialReportStepsProps) {

  const [step1, setStep1] = React.useState<z.infer<typeof ReportResumeSchema>>()
  const merchants = groupByMerchant(transactions)

  return (
    <>
      <CarouselItem>
        <div className="p-1" >
          <ReportResumeFormStep1 merchants={merchants} api={api} setFormData={setStep1} />
        </div>
      </CarouselItem>
      <CarouselItem>
        <div className="p-1" >
          {step1 &&
            <ReportResumeFormStep2 api={api} setShow={setShow} step1={step1} transactions={transactions} />
          }
        </div>
      </CarouselItem>

    </>
  )
}


export function groupByMerchant(transactions: BaseTransaction[]): ReportResumeType {
  const merchants = new Map<
    string,
    Map<
      string,
      Map<
        string,
        Set<string>
      >
    >
  >();

  for (const tx of transactions) {
    const merchantName = tx.merchantName;
    const countryName = tx.country;
    const providerId = tx.provider;
    const methodId = tx.payMethod;

    if (!merchants.has(merchantName)) {
      merchants.set(merchantName, new Map());
    }

    const countriesMap = merchants.get(merchantName)!;

    if (!countriesMap.has(countryName)) {
      countriesMap.set(countryName, new Map());
    }

    const providersMap = countriesMap.get(countryName)!;

    if (!providersMap.has(providerId)) {
      providersMap.set(providerId, new Set());
    }

    providersMap.get(providerId)!.add(methodId);
  }

  return Array.from(merchants.entries()).map(([merchantName, countriesMap]) => ({
    merchantName,
    countries: Array.from(countriesMap.entries()).map(([countryName, providersMap]) => ({
      countryName,
      providers: Array.from(providersMap.entries()).map(([providerId, methodsSet]) => ({
        providerId,
        providerName: providerId, // or lookup display name if you have one
        methods: Array.from(methodsSet).map((methodId) => ({
          methodId,
          methodName: methodId,
          commissionFormula: ""
        })),
      })),
    })),
  }));
}

