"use client"
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import React, { useEffect } from "react";
import { Step1Schema, Step2Schema } from "@/lib/zod/reportForm";
import z from "zod";
import { BaseTransaction } from "@/lib/types/transaction";
import { extractCountryProviders } from "@/lib/analytics/utils";
import { CountryProviders } from "@/lib/types/providers/getProvidersByCountry";
import ReportTypeSelect from "./reportTypeSelect";
import FinancialReportSteps from "./financialReport";
import { toast } from "sonner";
import ResumeReportSteps from "./resumeReport";
import { ReportResumeType } from "@/lib/zod/reportResumeForm";

export default function ReportForm({ transactions, setShow, merchantsNames }: {
  transactions: BaseTransaction[], setShow: React.Dispatch<React.SetStateAction<boolean>>, merchantsNames: string[]
}) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [reportType, setReportType] = React.useState<"financial" | "resume">()

  return (
    <Carousel
      draggable={false}
      opts={{
        watchDrag: false
      }}
      setApi={setApi} className="w-full max-w-md" >
      <CarouselContent >
        <CarouselItem>
          <ReportTypeSelect api={api} transactions={transactions} setType={setReportType} setShow={setShow} />
        </CarouselItem>
        {reportType == "resume" &&
          <ResumeReportSteps api={api} setShow={setShow} transactions={transactions} reportType={reportType} merchantsNames={merchantsNames} />
        }
        {reportType == "financial" &&
          <FinancialReportSteps api={api} setShow={setShow} transactions={transactions} reportType={reportType} merchantsNames={merchantsNames} />
        }
      </CarouselContent>
    </Carousel >
  )
}


