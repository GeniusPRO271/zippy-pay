import React from "react"
import {
  Field,
  FieldSet,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldContent,
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { PopoverMultiSelect } from "@/components/ui/multiSelect"
import { CountryProviders } from "@/lib/types/providers/getProvidersByCountry"

interface PaymentMethod {
  id: string
  name: string
}

interface Provider {
  id: string
  name: string
  methods: PaymentMethod[]
}

interface Country {
  name: string
  providers: Provider[]
}

interface ProviderEntry {
  providerId: string
  providerName: string
  methods: { methodId: string; methodName: string }[]
}

interface SingleCountryFieldProps {
  country: CountryProviders
  value?: ProviderEntry[]
  onChange?: (val: ProviderEntry[]) => void
}

export function SingleCountryField({ country, value = [], onChange }: SingleCountryFieldProps) {
  const providers = value

  const toggleProvider = (providerId: string, providerName: string) => {
    const exists = providers.some((p) => p.providerId === providerId)
    if (exists) {
      const updated = providers.filter((p) => p.providerId !== providerId)
      onChange?.(updated)
    } else {
      onChange?.([
        ...providers,
        {
          providerId,
          providerName,
          methods: [],
        },
      ])
    }
  }

  const updateMethods = (
    providerId: string,
    providerName: string,
    methods: string[]
  ) => {
    const existingIndex = providers.findIndex((p) => p.providerId === providerId)
    const updated = [...providers]

    // Find provider info from the country list
    const providerData = country.providers.find((p) => p.id === providerId)
    if (!providerData) return

    const selectedMethods = methods.map((id) => {
      const method = providerData.methods.find((m) => m.id === id)
      return {
        methodId: id,
        methodName: method ? method.name : "",
      }
    })

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        providerId,
        providerName,
        methods: selectedMethods,
      }
    } else {
      updated.push({
        providerId,
        providerName,
        methods: selectedMethods,
      })
    }

    onChange?.(updated)
  }

  const isSelected = (id: string) => providers.some((p) => p.providerId === id)
  const getMethods = (id: string) =>
    providers.find((p) => p.providerId === id)?.methods.map((m) => m.methodId) || []

  return (
    <FieldGroup>
      <FieldSet className="mb-4">
        <FieldLabel>{country.name}</FieldLabel>
        <FieldDescription>
          Providers found in {country.name} based on your uploaded data. You can select multiple providers.
        </FieldDescription>

        <div className="space-y-3 mt-2">
          {country.providers.map((provider, idx) => (
            <Field key={provider.id} orientation="horizontal" className="flex">
              <div className="flex items-center justify-center gap-2 w-full">
                <Checkbox
                  id={`${provider.id}-${idx}`}
                  checked={isSelected(provider.id)}
                  onCheckedChange={() =>
                    toggleProvider(provider.id, provider.name)
                  }
                />
                <FieldContent>
                  <PopoverMultiSelect
                    label={provider.name}
                    options={provider.methods.map((m) => ({
                      value: m.id,
                      label: m.name,
                    }))}
                    value={getMethods(provider.id)}
                    onChange={(methods) =>
                      updateMethods(provider.id, provider.name, methods)
                    }
                    disabled={!isSelected(provider.id)}
                  />
                </FieldContent>
              </div>
            </Field>
          ))}
        </div>
      </FieldSet>
    </FieldGroup>
  )
}
