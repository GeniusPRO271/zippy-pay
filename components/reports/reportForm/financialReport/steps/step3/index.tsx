"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CarouselApi } from "@/components/ui/carousel";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useCreateReport } from "@/hooks/useGenerateReport";
import { CreateReportRequest } from "@/lib/api/reportGenerator";
import { BaseTransaction } from "@/lib/types/transaction";
import { FinalMerchantCommissionSchema, FinalMerchantCommissionType, ProvidersSchemaType, Step1Schema, Step2Schema } from "@/lib/zod/reportForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";


export function mergeMerchantData(step1Data: z.infer<typeof Step1Schema>, step2Data: z.infer<typeof Step2Schema>): FinalMerchantCommissionType {
  const mergedProviders = step1Data.providers.map((p1) => {
    const matchingP2 = step2Data.providers.find((p2) => p2.providerId === p1.providerId);

    return {
      providerId: p1.providerId,
      providerName: p1.providerName,
      methods: p1.methods.map((m1) => {
        const matchingM2 = matchingP2?.methods.find((m2) => m2.methodId === m1.methodId);
        return {
          methodId: m1.methodId,
          methodName: m1.methodName,
          commissionFormula: matchingM2?.commissionFormula ?? "",
        };
      }),
    };
  });

  return {
    merchantName: step1Data.merchantName,
    countryId: step1Data.countryId,
    countryName: step1Data.countryName,
    providers: mergedProviders,
  };
}

export default function ReportFormStep3({
  api,
  step1,
  step2,
  transactions,
  setShow
}: {
  api: CarouselApi;
  step1: z.infer<typeof Step1Schema>;
  step2: z.infer<typeof Step2Schema>;
  transactions: BaseTransaction[]
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const form = useForm<FinalMerchantCommissionType>({
    resolver: zodResolver(FinalMerchantCommissionSchema),
    defaultValues: mergeMerchantData(step1, step2),
  });

  function showData(data: z.infer<typeof Step2Schema>) {
    toast("You submitted the following values:", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    });
  }
  const { mutate, isPending } = useCreateReport();
  function onSubmit(data: FinalMerchantCommissionType) {
    const filteredTransactions = transactions.filter(trx => trx.status === "ok");

    console.log(filteredTransactions[0]);

    const payload = {
      reportType: "financial",
      application: data,
      transactions: filteredTransactions,
    } as CreateReportRequest;

    mutate(payload);

    if (!isPending) {
      setShow(false);
    }
  }

  const { control } = form;
  const providers = form.getValues("providers") || []

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>
          Review all merchant details, providers, and commission formulas before submitting.
        </CardDescription>
      </CardHeader>

      <CardContent className="max-h-[441px] overflow-hidden">
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Merchant Name</h3>
            <p className="text-base font-semibold">{form.getValues("merchantName")}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Country</h3>
            <p className="text-base font-semibold">{form.getValues().countryName}</p>
          </div>

          <div className="pb-6 max-h-[320px] overflow-y-scroll">
            {providers.map((provider: any, pIndex: number) => (
              <div
                key={provider.providerId}
                className={`flex flex-col gap-2 ${pIndex > 0 ? "mt-4" : ""}`}
              >
                <h3 className="scroll-m-20 text-md font-semibold tracking-tight">
                  {provider.providerName}
                </h3>

                <div className="ml-3 border-l pl-4 space-y-3">
                  {provider.methods?.map((method: any, mIndex: number) => (
                    <Controller
                      key={method.methodId}
                      name={`providers.${pIndex}.methods.${mIndex}.commissionFormula`}
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground/80">
                            {method.methodName}
                          </span>
                          <Input
                            {...field}
                            readOnly
                            className="bg-muted cursor-not-allowed font-mono text-sm mt-1"
                            value={field.value || ""}
                            placeholder="No formula set"
                          />
                        </div>
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" form="form-rhf-demo" disabled={isPending}>
            {isPending ? <>
              <Spinner />
            </> :
              <>
                Generate & Save
              </>
            }
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
