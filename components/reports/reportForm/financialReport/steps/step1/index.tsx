import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CarouselApi } from "@/components/ui/carousel"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ProvidersSchemaType, Step1Schema } from "@/lib/zod/reportForm"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown } from "lucide-react"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { SingleCountryField } from "./multiProviderCountryField"
import { CountryProvider, CountryProviders } from "@/lib/types/providers/getProvidersByCountry"

export const getMerchantName = (input: string): string => {
  const match = input.match(/^\d{4}([A-Za-z]+)-[A-Za-z0-9]+$/);
  return match ? match[1] : input; // Fallback: return original if no match
};

export default function ReportFormStep1({ api, setFormData, providers, merchantsNames }: {
  api: CarouselApi, setFormData: React.Dispatch<React.SetStateAction<z.infer<typeof Step1Schema> | undefined>>, providers: CountryProviders[]
  merchantsNames: string[]
}) {

  const form = useForm<z.infer<typeof Step1Schema>>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      merchantName: "",
      countryId: "",
      providers: []
    },
  })

  const countries = providers.map((country) => ({
    value: country.id,
    label: country.isoCode,
  }))

  const merchants = merchantsNames.map((merchant) => ({
    value: merchant,
    label: getMerchantName((merchant)),
  }))


  function onSubmit(data: z.infer<typeof Step1Schema>) {
    if (!api) {
      return
    }
    setFormData(data)
    api.scrollNext()
  }

  const countryId = form.watch("countryId")
  return (
    <Card className="w-full  h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Please provide the merchant’s name and country of operation.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[441px] overflow-y-scroll">
        <form id="form-rhf-demo1" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="merchantName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    Merchant Name
                  </FieldLabel>
                  <MerchantSelect
                    merchantNames={merchants}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="countryId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    Country
                  </FieldLabel>
                  <CountrySelect
                    countries={countries}
                    value={{
                      id: form.getValues("countryId"),
                      name: form.getValues("countryName"),
                    }}
                    onChange={(val) => {
                      form.setValue("countryId", val.id)
                      form.setValue("countryName", val.name)
                    }}
                  />
                  <FieldDescription>
                    The counties on this list are the ones extracted from the data uploaded
                  </FieldDescription>
                </Field>
              )}
            />
            {countryId &&
              <Controller
                name="providers"
                control={form.control}
                render={({ field }) => (
                  <SingleCountryField country={providers.find((country) => country.id === form.getValues().countryId)!} {...field} />
                )}
              />
            }
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="form-rhf-demo1">
            Next
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
interface CountrySelectProps {
  countries: { value: string, label: string }[]
  value?: { id: string; name: string }
  onChange?: (value: { id: string; name: string }) => void
}

export function CountrySelect({ value, onChange, countries }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false)
  const selected = value ? countries.find((f) => f.value === value.id) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selected ? selected.label : "Select country..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." className="h-9" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((f) => (
                <CommandItem
                  key={f.value}
                  value={f.value}
                  onSelect={() => {
                    onChange?.({ id: f.value, name: f.label })
                    setOpen(false)
                  }}
                >
                  {f.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value?.id === f.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


interface MerchantSelectProps {
  merchantNames: { value: string; label: string }[]
  value?: string
  onChange?: (value: string) => void
}

export function MerchantSelect({ value, onChange, merchantNames }: MerchantSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selected = value ? merchantNames.find((m) => m.label === value) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selected ? selected.label : "Select merchant..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search merchant..." className="h-9" />
          <CommandList>
            <CommandEmpty>No merchant found.</CommandEmpty>
            <CommandGroup>
              {merchantNames.map((m) => (
                <CommandItem
                  key={m.value}
                  value={m.value}
                  onSelect={() => {
                    onChange?.(m.label)
                    setOpen(false)
                  }}
                >
                  {m.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === m.label ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
