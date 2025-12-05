'use client'

import { FieldErrors, UseFormReturn } from 'react-hook-form'
import { CreateReportSchemaType } from '@/lib/zod/createReport'
import { BaseTransaction } from '@/lib/types/transaction'
import React from 'react'
import { ReportResumePathSchemaType } from '@/lib/zod/reportResumeForm'

interface DailyReportPathProps {
  step: number
  direction: 'forward' | 'backward'
  form: UseFormReturn<CreateReportSchemaType>
  errors: FieldErrors<CreateReportSchemaType>
  onNext: () => void
  onBack: () => void
  onSubmit: () => void
}

export function ResumeReportPath({
  step,
  direction,
  form,
  errors,
  onNext,
  onBack,
  onSubmit,
}: DailyReportPathProps) {

  const transactionsResumeReport = form.watch("transactions")

  return (
    <>
      {/* <Step isActive={step === 1} isPast={step > 1} direction={direction}> */}
      {/* </Step> */}
      {/* <Step isActive={step === 2} isPast={step > 2} direction={direction}> */}
      {/*   <ReportGeneratorTransactionOverview form={form} transaction={transactionsResumeReport} onNext={onSubmit} onBack={onBack} /> */}
      {/* </Step> */}
    </>
  )
}

function groupByMerchant(transactions: BaseTransaction[]): ReportResumePathSchemaType {
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



