// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
// import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { cn } from "@/lib/utils"
// import { Check, ChevronsUpDown } from "lucide-react"
// import React, { useEffect } from "react"
// import { Controller, useForm, UseFormReturn, FieldErrors } from "react-hook-form"
// import { SingleCountryField } from "../../../utils/multiProviderCountryField"
// import { CreateReportSchemaType } from "@/lib/zod/createReport"
// import { ReportFinanceStep1Schema } from "@/lib/zod/reportFinancePath"
// import { z } from "zod"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { RangePickerButton } from "../../../utils/timeIntervalSelction"
// import { extractCountryProvidersByMerchant, filterTransactionsByCriteria } from "@/lib/analytics/utils"
//
// export const getMerchantName = (input: string): string => {
//   const match = input.match(/^\d{4}([A-Za-z]+)-[A-Za-z0-9]+$/)
//   return match ? match[1] : input
// }
//
// type Filters = {
//   dateRange: {
//     from?: Date
//     to?: Date
//   }
//   originalDateRange: {
//     from?: Date
//     to?: Date
//   }
// }
//
// interface ReportFinanceStep1Props {
//   form: UseFormReturn<CreateReportSchemaType>
//   errors: FieldErrors<CreateReportSchemaType>
//   onNext: () => void
//   onBack: () => void
//   merchantsNames: string[]
//   dateRange: Filters,
//   setDateRange: React.Dispatch<React.SetStateAction<Filters>>
// }
//
//
//
// export default function ReportFinanceStep1({
//   form,
//   onNext,
//   onBack,
//   merchantsNames,
//   dateRange,
//   setDateRange
// }: ReportFinanceStep1Props) {
//   const formLocal = useForm<z.infer<typeof ReportFinanceStep1Schema>>({
//     resolver: zodResolver(ReportFinanceStep1Schema),
//     defaultValues: {
//       merchantName: "",
//       countryId: "",
//       countryName: "",
//       providers: [],
//     },
//   })
//
//   const { watch, getValues, setValue, control } = formLocal
//
//   const transactions = form.watch('transactions')
//   const merchantName = watch("merchantName")
//
//   const providers: CountryProviders[] = React.useMemo(() => {
//     if (dateRange.dateRange.from && dateRange.dateRange.to && merchantName) {
//       return extractCountryProvidersByMerchant(transactions, dateRange.dateRange.from, dateRange.dateRange.to, merchantName)
//     }
//     return []
//   }, [dateRange, merchantName])
//
//   const countries = providers.map((country) => ({
//     value: country.id,
//     label: country.isoCode,
//   }))
//
//   const merchants = merchantsNames.map((merchant) => ({
//     value: merchant,
//     label: getMerchantName(merchant),
//   }))
//
//   const onSubmitLocalForm = (data: z.infer<typeof ReportFinanceStep1Schema>) => {
//     const transactionsFilter = filterTransactionsByCriteria(transactions, data)
//     const currentValues = form.getValues()
//
//     if (currentValues.reportType === "finance") {
//       const transactionsFilter = filterTransactionsByCriteria(transactions, data)
//
//       form.reset({
//         reportType: "finance",
//         parameters: {
//           ...currentValues.parameters, // ✅ safe now
//           ...data
//         },
//         transactions: transactionsFilter
//       })
//       onNext()
//     }
//   }
//
//   useEffect(() => {
//     formLocal.reset({
//       merchantName: formLocal.getValues("merchantName"),
//     })
//   }, [dateRange, merchantName])
//
//   return (
//     <Card className="w-full h-full overflow-hidden">
//       <CardHeader>
//         <CardTitle>Basic Information</CardTitle>
//         <CardDescription>
//           Please provide the merchants name and country of operation.
//         </CardDescription>
//       </CardHeader>
//
//       <CardContent className="h-full overflow-y-scroll">
//         <FieldGroup>
//           <Controller
//             name="merchantName"
//             control={control}
//             render={({ field, fieldState }) => (
//               <Field data-invalid={fieldState.invalid}>
//                 <FieldLabel>Merchant Name</FieldLabel>
//
//                 <MerchantSelect merchantNames={merchants} {...field} />
//
//                 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
//               </Field>
//             )}
//           />
//           <Field>
//             <FieldLabel>Date Range</FieldLabel>
//             <RangePickerButton filters={dateRange} setFilters={setDateRange} />
//             <FieldDescription>Select a date interval where you want to c</FieldDescription>
//           </Field>
//           <Controller
//             name="countryId"
//             control={control}
//             render={({ fieldState }) => (
//               <Field data-invalid={fieldState.invalid}>
//                 <FieldLabel>Country</FieldLabel>
//
//                 <CountrySelect
//                   countries={countries}
//                   value={{
//                     id: getValues("countryId"),
//                     name: getValues("countryName"),
//                   }}
//                   onChange={(val) => {
//                     setValue("countryId", val.id)
//                     setValue("countryName", val.name)
//                   }}
//                 />
//
//                 <FieldDescription>
//                   The countries on this list are extracted from your uploaded data.
//                 </FieldDescription>
//
//                 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
//
//                 {formLocal.formState.errors.countryName && (
//                   <FieldError errors={[formLocal.formState.errors.countryName]} />
//                 )}
//               </Field>
//             )}
//           />
//
//           {watch("countryId") && watch("merchantName") && (dateRange.dateRange.from && dateRange.dateRange.to) && (
//             <Controller
//               name="providers"
//               control={control}
//               render={({ field, fieldState }) => {
//                 const selectedCountry = providers.find((country) => country.id === getValues("countryId"))
//
//                 return (
//                   <>
//                     {selectedCountry ? (
//                       <>
//                         <SingleCountryField
//                           country={selectedCountry}
//                           {...field}
//                         />
//                         {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
//                       </>
//                     ) : (
//                       <Field>
//                         <FieldDescription>
//                           No providers found for the selected country in the current date range.
//                         </FieldDescription>
//                       </Field>
//                     )}
//                   </>
//                 )
//               }}
//             />
//           )}
//         </FieldGroup>
//       </CardContent>
//
//       <CardFooter>
//         <Field orientation="horizontal" className="flex h-full justify-end">
//           <Button onClick={onBack} variant="outline" className="cursor-pointer w-full flex-1">
//             Back
//           </Button>
//           <Button
//             className="cursor-pointer flex-1"
//             onClick={formLocal.handleSubmit(onSubmitLocalForm)}
//           >
//             Continue
//           </Button>
//         </Field>
//       </CardFooter>
//     </Card>
//   )
// }
//
// interface CountrySelectProps {
//   countries: { value: string; label: string }[]
//   value?: { id: string; name: string }
//   onChange?: (value: { id: string; name: string }) => void
// }
//
// export function CountrySelect({ value, onChange, countries }: CountrySelectProps) {
//   const [open, setOpen] = React.useState(false)
//   const selected = value ? countries.find((f) => f.value === value.id) : null
//
//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between" disabled={countries.length <= 0}>
//           {selected ? selected.label : "Select country..."}
//           <ChevronsUpDown className="opacity-50" />
//         </Button>
//       </PopoverTrigger>
//
//       <PopoverContent className="w-[200px] p-0">
//         <Command>
//           <CommandInput placeholder="Search country..." className="h-9" />
//
//           <CommandList>
//             <CommandEmpty>No country found.</CommandEmpty>
//
//             <CommandGroup>
//               {countries.map((f) => (
//                 <CommandItem
//                   key={f.value}
//                   value={f.value}
//                   onSelect={() => {
//                     onChange?.({ id: f.value, name: f.label })
//                     setOpen(false)
//                   }}
//                 >
//                   {f.label}
//
//                   <Check className={cn("ml-auto", value?.id === f.value ? "opacity-100" : "opacity-0")} />
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   )
// }
//
// interface MerchantSelectProps {
//   merchantNames: { value: string; label: string }[]
//   value?: string
//   onChange?: (value: string) => void
// }
//
// export function MerchantSelect({ value, onChange, merchantNames }: MerchantSelectProps) {
//   const [open, setOpen] = React.useState(false)
//   const selected = value ? merchantNames.find((m) => m.label === value) : null
//
//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
//           {selected ? selected.label : "Select merchant..."}
//           <ChevronsUpDown className="opacity-50" />
//         </Button>
//       </PopoverTrigger>
//
//       <PopoverContent className="w-[200px] p-0">
//         <Command>
//           <CommandInput placeholder="Search merchant..." className="h-9" />
//
//           <CommandList>
//             <CommandEmpty>No merchant found.</CommandEmpty>
//
//             <CommandGroup>
//               {merchantNames.map((m) => (
//                 <CommandItem
//                   key={m.value}
//                   value={m.value}
//                   onSelect={() => {
//                     onChange?.(m.label)
//                     setOpen(false)
//                   }}
//                 >
//                   {m.label}
//
//                   <Check className={cn("ml-auto", value === m.label ? "opacity-100" : "opacity-0")} />
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   )
// }
