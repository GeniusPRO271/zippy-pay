"use client"

import * as React from "react"
import { Control, Controller, FieldValues, Path, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PopoverMultiSelect } from "./multiSelect"
import { CountryProviders } from "@/lib/types/providers/getProvidersByCountry"


interface CountryProviderSelectorProps<TFormValues extends FieldValues> {
  countries: CountryProviders[]
  control: Control<TFormValues>
  setValue: UseFormSetValue<TFormValues>
  watch: UseFormWatch<TFormValues>
}

export function CountryProviderSelector<TFormValues extends FieldValues>({
  countries,
  setValue,
  watch,
}: CountryProviderSelectorProps<TFormValues>) {

  const providers = watch("providers" as Path<TFormValues>) as any[] || []
  console.log("Countries:", countries)
  return (
    <Card className="w-full sm:max-w-lg max-h-[462.75px] overflow-scroll scrollbar-hidden">
      <CardHeader>
        Providers
        <CardDescription>
          Select the providers and methods you want to use for each country.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {countries.map((country, countryIndex) => {
            const providerEntry = providers.find((p) => p?.countryName === country.name)
            const selectedProviderId = providerEntry?.providerId || ""

            return (
              <FieldSet key={country.name} className="mb-4">
                <FieldLabel>{country.name}</FieldLabel>
                <FieldDescription>
                  Providers we support in {country.name}. You can only select one provider at a time.
                </FieldDescription>

                <RadioGroup
                  value={selectedProviderId}
                  onValueChange={(val) => {
                    const existingIndex = providers.findIndex((p) => p?.countryName === country.name)

                    const newProvider = {
                      countryName: country.name,
                      providerId: val,
                      paymentMethodIds: [],
                    }


                    if (existingIndex >= 0) {
                      const updatedProviders = [...providers]
                      updatedProviders[existingIndex] = newProvider
                      setValue("providers" as Path<TFormValues>, updatedProviders as any)
                    } else {
                      setValue("providers" as Path<TFormValues>, [...providers, newProvider] as any)
                    }
                  }}
                >
                  {country.providers.map((provider) => (
                    <Field key={provider.id} orientation="horizontal" className="flex">
                      <div className="flex items-center justify-center gap-2 w-full">
                        <RadioGroupItem
                          value={provider.id}
                          id={`${provider.id}-${countryIndex}`}
                        />
                        <FieldContent>
                          <PopoverMultiSelect
                            label={provider.name}
                            options={provider.methods.map((m) => ({
                              value: m.id,
                              label: m.name,
                            }))}
                            value={
                              selectedProviderId === provider.id
                                ? providerEntry?.paymentMethodIds || []
                                : []
                            }
                            onChange={(methods) => {
                              const existingIndex = providers.findIndex((p) => p?.countryName === country.name)

                              if (existingIndex >= 0) {
                                const updatedProviders = [...providers]
                                updatedProviders[existingIndex] = {
                                  ...updatedProviders[existingIndex],
                                  paymentMethodIds: methods,
                                }
                                setValue("providers" as Path<TFormValues>, updatedProviders as any)
                              }
                            }}
                            disabled={selectedProviderId !== provider.id}
                            resetKey={selectedProviderId}
                          />
                        </FieldContent>
                      </div>
                    </Field>
                  ))}
                </RadioGroup>
              </FieldSet>
            )
          })}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
