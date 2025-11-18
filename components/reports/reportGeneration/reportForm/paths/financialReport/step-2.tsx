import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CreateReportSchemaType } from "@/lib/zod/createReport";
import { Controller, UseFormReturn } from "react-hook-form";
import { HelperDialog } from "../../../utils/helperDialog";

interface ReportFinanceStep2Props {
  form: UseFormReturn<CreateReportSchemaType>
  onNext: () => void
  onBack: () => void
}

export default function ReportFinanceStep2({
  form,
  onNext,
  onBack,
}: ReportFinanceStep2Props) {

  const { control, watch, handleSubmit } = form;

  function onSubmit() {
    onNext()
  }

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Commissions</CardTitle>
        <CardDescription>
          Define commission formulas for each payment method.
        </CardDescription>
        <CardAction>
          <HelperDialog />
        </CardAction>
      </CardHeader>

      <CardContent className="h-full overflow-y-scroll">
        <div className={"flex flex-col gap-2"} onSubmit={handleSubmit(onSubmit)}>
          {watch("parameters.providers").map((provider, pIndex) => (
            <div
              key={provider.providerId}
              className={`flex flex-col border-dashed border p-5 gap-2 rounded-xl ${pIndex > 0 ? "mt-2" : ""}`}
            >
              <h3 className="scroll-m-20 text-lg font-semibold tracking-tight ">
                {provider.providerId}
              </h3>
              <FieldGroup>
                {provider.methods?.map((method, mIndex) => (
                  <Controller
                    key={method.methodId}
                    name={`parameters.providers.${pIndex}.methods.${mIndex}.commissionFormula`}
                    control={control}

                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-sm">
                          {method.methodId} Formula
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
        </div>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal" className="flex h-full justify-end ">
          <Button onClick={onBack} variant="outline" className="cursor-pointer w-full flex-1">
            Back
          </Button>
          <Button
            className="cursor-pointer flex-1"
            onClick={handleSubmit(onSubmit)}
          >
            Continue
          </Button>
        </Field>
      </CardFooter>
    </Card >
  );
}
