"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CreateMerchantForm, CreateMerchantFormType } from "@/lib/zod/createMerchant"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconInfoCircle } from "@tabler/icons-react"
import { CountryProviderSelector } from "./countryProviderSelector"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { PopoverMultiSelect } from "./country-dropdown"
import { CountryProviders } from "@/lib/types/providers/getProvidersByCountry"
import { useCreateMerchant } from "@/lib/hooks/merchant/createMerchantAction"
import { Spinner } from "@/components/ui/spinner"

function CreateMerchantComponentForm({ countriesWithProviders }: { countriesWithProviders: CountryProviders[] }) {

  const form = useForm<CreateMerchantFormType>({
    resolver: zodResolver(CreateMerchantForm),
    defaultValues: {
      basicInfo: { name: "", email: "", businessType: "" },
      countries: { countryIds: [] },
      providers: [],
    },
  })

  const selectedCountryIds = form.watch("countries.countryIds")
  const filterCountries = countriesWithProviders.filter((c) => selectedCountryIds.includes(c.id))
  const { mutate, isPending } = useCreateMerchant();

  async function onSubmit(data: z.infer<typeof CreateMerchantForm>) {
    mutate(data)

  }

  return (
    <div className="flex gap-2 justify-start items-start w-full">
      <Card className="w-xl">
        <CardHeader>
          <CardTitle>Create Merchant</CardTitle>
          <CardDescription>
            Fill the details of the merchant and select its providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="basicInfo.name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-description" className="flex w-full items-center justify-between">
                      Business Name
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconInfoCircle size={18} className="text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="mb-1">
                          <p>Write the name of your business as on legal entity</p>
                        </TooltipContent>
                      </Tooltip>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your business's legal name"
                      autoComplete="off"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="flex gap-4">
                <Controller
                  name="basicInfo.businessType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Business Type</FieldLabel>
                      <Input
                        {...field}
                        placeholder="E.g., E-commerce, Gambling"
                        autoComplete="off"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="basicInfo.email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Contact Email</FieldLabel>
                      <Input
                        {...field}
                        placeholder="example@gmail.com"
                        autoComplete="off"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}

                    </Field>
                  )}
                />
              </div>

              <Controller
                name="countries.countryIds"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Country</FieldLabel>
                    <PopoverMultiSelect
                      field={field}
                      fieldState={fieldState}
                      options={countriesWithProviders.map((c) => ({
                        value: c.id,
                        label: c.name
                      }))}
                      label="Providers Countries"
                    />
                    <FieldDescription>
                      Select countries you want to provide services in.
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

                  </Field>
                )}
              />
              {filterCountries.length > 0 && (
                <CountryProviderSelector
                  countries={filterCountries}
                  control={form.control}
                  setValue={form.setValue}
                  watch={form.watch}
                />

              )}
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending ? <>
              <Spinner />
              Creating
            </> :
              "Submit"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default CreateMerchantComponentForm
