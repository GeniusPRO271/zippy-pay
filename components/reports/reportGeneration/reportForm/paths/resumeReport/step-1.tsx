import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import React from "react"
import { Controller, useForm, UseFormReturn, FieldErrors } from "react-hook-form"
import { CreateReportSchemaType } from "@/lib/zod/createReport"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReportResumePathSchema, ReportResumePathSchemaType } from "@/lib/zod/reportResumeForm"
import { Input } from "@/components/ui/input"
import { HelperDialog } from "../../../utils/helperDialog"

export const getMerchantName = (input: string): string => {
  const match = input.match(/^\d{4}([A-Za-z]+)-[A-Za-z0-9]+$/)
  return match ? match[1] : input
}

interface ReportFinanceStep1Props {
  form: UseFormReturn<CreateReportSchemaType>
  errors: FieldErrors<CreateReportSchemaType>
  onNext: () => void
  onBack: () => void
  merchants: ReportResumePathSchemaType
}

export default function ReportResumeStep1({
  form,
  onNext,
  onBack,
  merchants,
}: ReportFinanceStep1Props) {
  const formLocal = useForm<z.infer<typeof ReportResumePathSchema>>({
    resolver: zodResolver(ReportResumePathSchema),
    defaultValues: {
      merchants: merchants
    }
  });

  const { control } = formLocal


  const onSubmitLocalForm = (data: z.infer<typeof ReportResumePathSchema>) => {
    form.reset({
      reportType: "resume",
      parameters: {
        ...form.getValues().parameters,
        ...data
      },
      transactions: form.getValues("transactions")
    })

    onNext()
  }


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Commissions</CardTitle>
        <CardDescription>
          Define commission formulas for each payment method.
        </CardDescription>
        <CardAction>
          <HelperDialog />
        </CardAction>
      </CardHeader>

      <CardContent className="max-h-[441px] overflow-y-scroll">
        {merchants.map((merchant, merchantIndex) => (
          <div key={merchant.merchantName} className="mt-2">
            <h2 className="text-xl font-bold">{merchant.merchantName}</h2>

            {merchant.countries.map((country, countryIndex) => (
              <div key={country.countryName} className="ml-2 mt-4">
                <h3 className="text-lg font-semibold">{country.countryName}</h3>

                {country.providers.map((provider, providerIndex) => (
                  <div
                    key={provider.providerId}
                    className="flex flex-col border-dashed border p-4 gap-4 rounded-xl mt-4"
                  >
                    <h4 className="text-md font-semibold tracking-tight">
                      {provider.providerName}
                    </h4>

                    <FieldGroup>
                      {provider.methods.map((method, methodIndex) => (
                        <Controller
                          key={method.methodId}
                          control={control}
                          name={`merchants.${merchantIndex}.countries.${countryIndex}.providers.${providerIndex}.methods.${methodIndex}.commissionFormula`}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                              <FieldLabel className="text-sm">
                                {method.methodName} Formula
                              </FieldLabel>
                              <Input {...field} placeholder="e.g. (amount * 0.03) + 100" />
                              {fieldState.error && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      ))}
                    </FieldGroup>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal" className="flex h-full justify-end">
          <Button onClick={onBack} variant="outline" className="cursor-pointer w-full flex-1">
            Back
          </Button>
          <Button
            className="cursor-pointer flex-1"
            onClick={formLocal.handleSubmit(onSubmitLocalForm)}
          >
            Continue
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}


