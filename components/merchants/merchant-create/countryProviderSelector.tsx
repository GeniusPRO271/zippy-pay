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
import { CountryWithProviders } from "@/lib/types/country"


interface CountryProviderSelectorProps<TFormValues extends FieldValues> {
  countries: CountryWithProviders[]
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
            const providerEntry = providers.find((p) => p?.countryName === country.countryName)
            const selectedProviderId = providerEntry?.providerId || ""

            return (
              <FieldSet key={country.countryName} className="mb-4">
                <FieldLabel>{country.countryName}</FieldLabel>
                <FieldDescription>
                  Providers we support in {country.countryName}. You can only select one provider at a time.
                </FieldDescription>

                <RadioGroup
                  value={selectedProviderId}
                  onValueChange={(val) => {
                    const existingIndex = providers.findIndex((p) => p?.countryName === country.countryName)

                    const newProvider = {
                      countryName: country.countryName,
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
                    <Field key={provider.providerId} orientation="horizontal" className="flex">
                      <div className="flex items-center justify-center gap-2 w-full">
                        <RadioGroupItem
                          value={provider.providerId}
                          id={`${provider.providerId}-${countryIndex}`}
                        />
                        <FieldContent>
                          <PopoverMultiSelect
                            label={provider.providerName}
                            options={provider.methods.map((m) => ({
                              value: m.id,
                              label: m.name,
                            }))}
                            value={
                              selectedProviderId === provider.providerId
                                ? providerEntry?.paymentMethodIds || []
                                : []
                            }
                            onChange={(methods) => {
                              const existingIndex = providers.findIndex((p) => p?.countryName === country.countryName)

                              if (existingIndex >= 0) {
                                const updatedProviders = [...providers]
                                updatedProviders[existingIndex] = {
                                  ...updatedProviders[existingIndex],
                                  paymentMethodIds: methods,
                                }
                                setValue("providers" as Path<TFormValues>, updatedProviders as any)
                              }
                            }}
                            disabled={selectedProviderId !== provider.providerId}
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
