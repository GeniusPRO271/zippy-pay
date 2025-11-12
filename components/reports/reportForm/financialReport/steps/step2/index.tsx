import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CarouselApi } from "@/components/ui/carousel";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ProvidersSchemaType, Step2Schema } from "@/lib/zod/reportForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import React from "react";
import { HelperDialog } from "../../../helperDialog";


export const buildStep2InitialValues = (
  providers: ProvidersSchemaType
): z.infer<typeof Step2Schema>["providers"] => {
  return providers.map((provider) => ({
    providerId: provider.providerId,
    methods: provider.methods.map((method) => ({
      methodId: method.methodId,
      commissionFormula: "",
    })),
  }));
};

export default function ReportFormStep2({
  api,
  providers,
  setFormData
}: {
  api: CarouselApi;
  providers: ProvidersSchemaType;
  setFormData: React.Dispatch<React.SetStateAction<z.infer<typeof Step2Schema> | undefined>>
}) {
  const form = useForm<z.infer<typeof Step2Schema>>({
    resolver: zodResolver(Step2Schema),
    defaultValues: {
      providers: buildStep2InitialValues(providers),
    },
  });

  const { control } = form;

  function onSubmit(data: z.infer<typeof Step2Schema>) {
    setFormData(data)
    if (api) api.scrollNext()
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
        <form id="form-rhfa-demo" className={"flex flex-col gap-2"} onSubmit={form.handleSubmit(onSubmit)}>
          {providers.map((provider, pIndex) => (
            <div
              key={provider.providerId}
              className={`flex flex-col border-dashed border p-5 gap-2 rounded-xl ${pIndex > 0 ? "mt-2" : ""}`}
            >
              <h3 className="scroll-m-20 text-lg font-semibold tracking-tight ">
                {provider.providerName}
              </h3>
              <FieldGroup>
                {provider.methods?.map((method, mIndex) => (
                  <Controller
                    key={method.methodId}
                    name={`providers.${pIndex}.methods.${mIndex}.commissionFormula`}
                    control={control}

                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-sm">
                          {method.methodName} Formula
                        </FieldLabel>
                        <Input
                          {...field}
                          placeholder="e.g. (amount * 0.03) + 100"
                          id={`providers-${pIndex}-method-${mIndex}`}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                ))}
              </FieldGroup>
            </div>
          ))}
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="form-rhfa-demo">
            Next
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
