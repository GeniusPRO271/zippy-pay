'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CreateReportSchema, CreateReportSchemaType } from '@/lib/zod/createReport'
import { Step } from '@/components/ui/stepHandler'
import ReportTypeSelect from './paths/selectPath'
import { FinancialReportPath } from './paths/financialReport/financialReportPath'
import { BaseTransaction } from '@/lib/types/transaction'
import { ResumeReportPath } from './paths/resumeReport/resumeReportPath'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateReport } from '@/hooks/useGenerateReport'
import { toast } from 'sonner'

interface ReportFormProps {
  transactions: BaseTransaction[]
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}
export default function ReportForm({ transactions, setShow }: ReportFormProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  const form = useForm<CreateReportSchemaType>({
    resolver: zodResolver(CreateReportSchema),
    defaultValues: {
      reportType: "finance",
      parameters: {},
      transactions: transactions
    }
  });

  const { control, watch, handleSubmit, formState: { errors } } = form;

  const reportType = watch('reportType')

  const getTotalSteps = () => {
    return reportType ? 4 : 1
  }

  const handleNext = () => {
    const totalSteps = getTotalSteps()
    console.log("STEPS: ", totalSteps)
    if (step < totalSteps - 1) {
      setDirection('forward')
      setStep(step + 1)
      console.log("STEPS TRANS: ", step + 1)

    }
  }

  const handleBack = () => {
    if (step > 0) {
      setDirection('backward')
      setStep(step - 1)
    }
  }

  const { mutateAsync } = useCreateReport()
  const onSubmit = (data: CreateReportSchemaType) => {
    toast.promise(
      mutateAsync(data),
      {
        loading: "We are creating your report...",
      }
    )
    setShow(false)
  }


  return (
    <div className="w-full h-full ">
      <div className="relative h-full overflow-hidden">
        <Step isActive={step === 0} isPast={step > 0} direction={direction}>
          <ReportTypeSelect control={control} onNext={handleNext} />
        </Step>
        {reportType === 'finance' && (
          <FinancialReportPath
            step={step}
            direction={direction}
            form={form}
            errors={errors}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit(onSubmit)}
          />
        )}
        {reportType === 'resume' && (
          <ResumeReportPath
            step={step}
            direction={direction}
            form={form}
            errors={errors}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit(onSubmit)}
          />
        )}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: getTotalSteps() }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${index === step
              ? 'bg-primary scale-125'
              : index < step
                ? 'bg-primary/60'
                : 'bg-muted'
              }`}
          />
        ))}
      </div>
    </div>

  )
}
