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
import { ReportResumeSchema, ReportResumeType } from "@/lib/zod/reportResumeForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

export default function ReportResumeFormStep2({
  api,
  step1,
  transactions,
  setShow
}: {
  api: CarouselApi;
  step1: z.infer<typeof ReportResumeSchema>;
  transactions: BaseTransaction[];
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {

  const form = useForm<z.infer<typeof ReportResumeSchema>>({
    resolver: zodResolver(ReportResumeSchema),
    defaultValues: step1,
  });

  const { control } = form;
  const merchants = form.watch("merchants") ?? [];

  const { mutate, isPending } = useCreateReport();

  function onSubmit(data: z.infer<typeof ReportResumeSchema>) {
    console.log("data submit: ", data)
    console.log("Sucess form now generating resume...")
    const okCount = transactions.filter((tx) => tx.status === "ok").length;
    const errorCount = transactions.filter((tx) => tx.status === "error").length;
    const pendingCount = transactions.filter((tx) => tx.status === "pending").length;

    console.log(
      `Transactions summary — OK: ${okCount}, ERROR: ${errorCount}, PENDING: ${pendingCount}`
    );
    const payload: CreateReportRequest = {
      reportType: "resume",
      application: data.merchants,
      transactions: transactions,
    };

    mutate(payload);
    if (!isPending) setShow(false);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Overview & Commissions</CardTitle>
        <CardDescription>
          Review all levels: merchant → countries → providers → methods.
        </CardDescription>
      </CardHeader>

      <CardContent className="max-h-[441px] overflow-y-scroll">
        <form id="form-final" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {merchants.map((merchant, merchantIndex) => (
            <div key={merchant.merchantName} className="mt-4">
              <h2 className="text-xl font-bold">{merchant.merchantName}</h2>

              {merchant.countries.map((country, countryIndex) => (
                <div key={country.countryName} className="ml-3 mt-4">
                  <h3 className="text-lg font-semibold">{country.countryName}</h3>

                  {country.providers.map((provider, providerIndex) => (
                    <div key={provider.providerId} className="ml-4 border-l pl-4 mt-4 space-y-3">
                      <h4 className="text-md font-semibold">{provider.providerName}</h4>

                      {provider.methods.map((method, methodIndex) => (
                        <Controller
                          key={method.methodId}
                          control={control}
                          name={`merchants.${merchantIndex}.countries.${countryIndex}.providers.${providerIndex}.methods.${methodIndex}.commissionFormula`}
                          render={({ field }) => (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{method.methodName}</span>
                              <Input
                                {...field}
                                placeholder="(amount * 0.03) + 100"
                                className="font-mono text-sm mt-1"
                              />
                            </div>
                          )}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" form="form-final" disabled={isPending}>
            {isPending ? <Spinner /> : "Generate & Save"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
