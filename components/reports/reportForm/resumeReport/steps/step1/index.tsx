import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CarouselApi } from "@/components/ui/carousel";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import React from "react";
import { HelperDialog } from "../../../helperDialog";

import { ReportResumeSchema, ReportResumeType } from "@/lib/zod/reportResumeForm";
import { toast } from "sonner";

export function buildReportResumeInitialValues(
  merchants: ReportResumeType
): z.infer<typeof ReportResumeSchema> {
  return {
    merchants: merchants.map((merchant) => ({
      merchantName: merchant.merchantName,
      countries: merchant.countries.map((country) => ({
        countryName: country.countryName,
        providers: country.providers.map((provider) => ({
          providerId: provider.providerId,
          providerName: provider.providerName,
          methods: provider.methods.map((method) => ({
            methodId: method.methodId,
            methodName: method.methodName,
            commissionFormula: "",
          })),
        })),
      })),
    }))
  };
}

export default function ReportResumeFormStep1({
  api,
  merchants,
  setFormData
}: {
  api: CarouselApi;
  merchants: ReportResumeType;
  setFormData: React.Dispatch<React.SetStateAction<z.infer<typeof ReportResumeSchema> | undefined>>
}) {
  const form = useForm<z.infer<typeof ReportResumeSchema>>({
    resolver: zodResolver(ReportResumeSchema),
    defaultValues: buildReportResumeInitialValues(merchants),
  });

  const { control } = form;

  const merchantsData = form.watch("merchants") ?? [];

  console.log("DEFAULT", buildReportResumeInitialValues(merchants));
  console.log("MERCHANTS PROP", merchants);
  console.log("WATCH", form.watch());

  function displayData() {
    const data = form.getValues();
    toast("Current Form Values", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 max-h-[300px] overflow-y-auto rounded-md p-4 text-xs whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius) + 4px)",
      } as React.CSSProperties,
    });
  }
  function onSubmit(data: z.infer<typeof ReportResumeSchema>) {
    setFormData(data);
    console.log("SUBMITED DATA:", data)
    if (api) api.scrollNext();
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
        <form id="form-step-2" className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          {merchantsData.map((merchant, merchantIndex) => (
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
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>

          <Button type="button" variant="secondary" onClick={displayData}>
            Display Data
          </Button>

          <Button type="submit" form="form-step-2">
            Next
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
