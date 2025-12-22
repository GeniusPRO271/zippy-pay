'use client'

import { FieldErrors, UseFormReturn } from 'react-hook-form'
import { CreateReportSchemaType } from '@/lib/zod/createReport'
import { Step } from '@/components/ui/stepHandler'
import ReportFinanceStep1 from './step-1'
import React, { useState, useMemo } from 'react'
import ReportFinanceStep2 from './step-2'
import { useFinancialReportWorker } from '@/lib/analytics/useFinancialReportWorker'

export type FinancalReportPathFilters = {
  dateRange: {
    from?: Date
    to?: Date
  }
  originalDateRange: {
    from?: Date
    to?: Date
  }
}

interface FinancialReportPathProps {
  step: number
  direction: 'forward' | 'backward'
  form: UseFormReturn<CreateReportSchemaType>
  errors: FieldErrors<CreateReportSchemaType>
  onNext: () => void
  onBack: () => void
  onSubmit: () => void
}

export function FinancialReportPath({
  step,
  direction,
  form,
  errors,
  onNext,
  onBack,
}: FinancialReportPathProps) {

  const transactions = form.watch("transactions");

  const initialDateRange = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        dateRange: { from: undefined, to: undefined },
        originalDateRange: { from: undefined, to: undefined },
      };
    }

    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      const ts = t.dateRequest ? new Date(t.dateRequest).getTime() : t.request_timestamp ?? 0

      if (ts < min) min = ts;
      if (ts > max) max = ts;
    }

    return {
      dateRange: {
        from: new Date(min),
        to: new Date(max),
      },
      originalDateRange: {
        from: new Date(min),
        to: new Date(max),
      },
    };
  }, [transactions]);

  const [dateRange, setDateRange] =
    useState<FinancalReportPathFilters>(initialDateRange);

  const {
    loading,
    uniqueMerchantNames,
  } = useFinancialReportWorker({
    transactions,
    dateRange,
  });

  if (loading) {
    return (
      <Step isActive={step === 1} isPast={step > 1} direction={direction}>
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-xs text-muted-foreground">
            {loading ? "Loading form..." : "No analytics available for current filters."}
          </span>
        </div>
      </Step>
    );
  }
  return (
    <>
      {/* STEP 1 — Filtering UI */}
      <Step isActive={step === 1} isPast={step > 1} direction={direction}>
        <ReportFinanceStep1
          form={form}
          errors={errors}
          onNext={onNext}
          onBack={onBack}
          merchantsNames={uniqueMerchantNames}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </Step>

      {/* STEP 2 — Providers */}
      {form.watch("parameters.providers") && (
        <Step isActive={step === 2} isPast={step > 2} direction={direction}>
          <ReportFinanceStep2 form={form} onNext={onNext} onBack={onBack} />
        </Step>
      )}

      {/* STEP 3 — Final Overview */}
      {/* <Step isActive={step === 3} isPast={step > 3} direction={direction}> */}
      {/*   <ReportGeneratorTransactionOverview */}
      {/*     form={form} */}
      {/*     transaction={transactionsFinancialReport} */}
      {/*     onNext={onSubmit} */}
      {/*     onBack={onBack} */}
      {/*   /> */}
      {/* </Step> */}
    </>
  );
}
