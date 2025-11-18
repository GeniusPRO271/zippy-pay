'use client'

import { FieldErrors, UseFormReturn } from 'react-hook-form'
import { CreateReportSchemaType } from '@/lib/zod/createReport'
import { Step } from '@/components/ui/stepHandler'
import ReportFinanceStep1 from './step-1'
import React, { useMemo, useState } from 'react'
import { filterTransactionsByDateRange } from '@/lib/analytics/utils'
import ReportFinanceStep2 from './step-2'
import ReportGeneratorTransactionOverview from '../transacionOverview'

type Filters = {
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
  onSubmit,
}: FinancialReportPathProps) {

  const transactions = form.watch("transactions");

  const initialDateRange = useMemo(() => {
    if (transactions.length === 0) {
      return {
        dateRange: {
          from: undefined,
          to: undefined
        },
        originalDateRange: {
          from: undefined,
          to: undefined
        }
      }
    }

    const dates = transactions.map(t => new Date(t.dateRequest._seconds * 1000))

    const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())))

    return {
      dateRange: {
        from: oldestDate,
        to: latestDate
      },
      originalDateRange: {
        from: oldestDate,
        to: latestDate
      }
    }
  }, [transactions])

  const [dateRange, setDateRange] = useState<Filters>(initialDateRange)


  const transactionsFinancialReport = useMemo(() => {
    const { from, to } = dateRange.dateRange

    if (!from || !to) {
      const { from: fromOriginal, to: toOriginal } = dateRange.originalDateRange

      if (fromOriginal && toOriginal) {
        const transactionsOriginal = filterTransactionsByDateRange(
          transactions,
          fromOriginal,
          toOriginal
        )
        return transactionsOriginal.filter(trx => trx.status === "ok")
      }

      return transactions.filter(trx => trx.status === "ok")
    }

    const filtered = filterTransactionsByDateRange(transactions, from, to)
    return filtered.filter(trx => trx.status === "ok")
  }, [transactions, dateRange])

  const uniqueMerchantNames = [
    ...new Set(transactionsFinancialReport.map(trx => trx.merchantName))
  ];



  return (
    <>
      <Step isActive={step === 1} isPast={step > 1} direction={direction}>
        <ReportFinanceStep1 form={form} errors={errors} onNext={onNext} onBack={onBack} merchantsNames={uniqueMerchantNames} dateRange={dateRange} setDateRange={setDateRange} />
      </Step>

      {form.watch("parameters.providers") &&
        <Step isActive={step === 2} isPast={step > 2} direction={direction}>
          <ReportFinanceStep2 form={form} onNext={onNext} onBack={onBack} />
        </Step>
      }
      <Step isActive={step === 3} isPast={step > 3} direction={direction}>
        <ReportGeneratorTransactionOverview form={form} transaction={transactionsFinancialReport} onNext={onSubmit} onBack={onBack} />
      </Step>
    </>
  )
}
