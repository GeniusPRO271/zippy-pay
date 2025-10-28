"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PaymentFormSchema, PaymentFormSchemaType } from "./payment/formSchema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { CalendarIcon, LockIcon } from "lucide-react"
import { paymentMethods } from "./payment/paymentMethodsConst"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { cn } from "@/lib/utils"
import { documentIDCountries } from "./payment/documentID"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { ContriesSelect, countriesData } from "./payment/countryConst"
import { useState } from "react"
import { format } from "date-fns"
import { Card } from "./ui/card"
import { toast } from "sonner"
import { PayInRequest } from "@/lib/api/zippy"
import { usePayIn } from "@/hooks/usePayIn"

function PaymentForm() {
  const form = useForm<PaymentFormSchemaType>({
    resolver: zodResolver(PaymentFormSchema),
  })

  const currencyMap: Record<string, string> = {
    BR: "R$",
    CL: "CLP",
    EC: "USD",
  };

  const { mutate } = usePayIn()
  function onSubmit(data: PaymentFormSchemaType) {
    const formattedData: PayInRequest = {
      amount: parseFloat(data.amount).toFixed(2),
      email: data.email,
      payMethod: data.paymentMethod,
      documentId: "212270539",
      // documentId: data.documentId ? data.documentId.replace(/\D/g, "") : "1",
      country: data.country,
      name: data.cardHoldersName,
      merchantId: "2025Tjben-h6j3",
      transactionId: Date.now().toString(),
      currency: currencyMap[currentCountry],
      timestamp: Math.floor(Date.now() / 1000).toString(),
      payinExpirationTime: "15",
      url_OK: "https://google.cl",
      url_ERROR: "http://youtube.com",
      objData: {},
    };

    mutate(formattedData)

    toast("Payment Data Submitted", {
      description: (
        <div style={{ lineHeight: 1.5 }}>
          <strong>Amount:</strong> {data.amount} <br />
          <strong>Name:</strong> {data.cardHoldersName} <br />
          <strong>Country:</strong> {data.country} <br />
          <strong>Currency:</strong> {currencyMap[currentCountry]} <br />
          <strong>Document ID:</strong> {data.documentId} <br />
          <strong>Email:</strong> {data.email} <br />
          <strong>Payment Method:</strong> {data.paymentMethod}
        </div>
      ),

      action: {
        label: "Close",
        onClick: () => console.log("Toast closed"),
      },
    });

    // For debugging
    console.log("[DEBUG] DATA: ", data);
  }

  const [currentCountry, setCurrentCountry] = useState<string>("")
  return (
    <Card className="w-[400px] flex justify-center items-center p-5 border shadow-none rounded-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="text-sm space-y-6">
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    value={field.value} // controlled value
                    onValueChange={(val) => {
                      field.onChange(val);
                      console.log("[DEBUG] Method Selected: ", val);
                    }}
                    className="h-fit grid grid-cols-3 gap-4"
                  >
                    {paymentMethods.map((method) => (
                      <Label
                        key={method.id} // unique key
                        htmlFor={method.id}
                        className="border-muted hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex flex-col items-start justify-between rounded-md border-2 bg-transparent p-2"
                      >
                        <RadioGroupItem
                          value={method.id}
                          id={method.id}
                          className="peer sr-only"
                          aria-label={method.id}
                        />
                        <method.icon className="size-4" />
                        <span className="font-normal text-sm">{method.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    form.setValue("documentId", "");
                    setCurrentCountry(val);
                  }}
                  defaultValue={field.value}>
                  <FormLabel>Country</FormLabel>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countriesData.map((country: ContriesSelect) => {
                      return (
                        <SelectItem key={country.id} value={country.id}>{country.label}</SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => {
              const currencyMap: Record<string, string> = {
                BR: "R$",   // Brazil uses Brazilian Real
                CL: "CLP",  // Chile uses Chilean Peso
                EC: "USD",  // Ecuador uses US Dollar
              };

              const currency = currencyMap[currentCountry] || "";

              return (
                <FormItem>
                  <FormLabel>Amount {currency}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={currency}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input placeholder="benamintoroj@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => {
              const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
                console.log("[DEBUG] CARD NUMBER BEFORE MASK: ", e.target.value)
                let value = e.target.value.replace(/\D/g, "");
                value = value.substring(0, 19);
                const formattedValue = value.replace(/(.{4})/g, "$1 ").trim();

                console.log("[DEBUG] CARD NUMBER AFTER MASK: ", formattedValue)
                console.log("[DEBUG] CARD NUMBER LENGTH: ", formattedValue.length)
                field.onChange(formattedValue);
              };

              return (
                <FormItem>
                  <FormLabel>Card number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="1234 5678 9012 3456"
                      onChange={handleCardInput}
                      value={field.value ?? ""}
                      maxLength={19} // 19 digits + up to 4 spaces
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[163px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(23, 59, 59, 999);
                          return date <= today;
                        }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => {
                const handleCvvInput = (e: React.ChangeEvent<HTMLInputElement>) => {
                  let value = e.target.value.replace(/\D/g, "");
                  value = value.substring(0, 4);
                  field.onChange(value);
                };

                return (
                  <FormItem>
                    <FormLabel>Security code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123"
                        onChange={handleCvvInput}
                        maxLength={4} // 3 or 4 digits
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

          </div>
          <FormField
            control={form.control}
            name="cardHoldersName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CardHolders name</FormLabel>
                <FormControl>
                  <Input placeholder="Benjamin Toro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {documentIDCountries.some(c => c.id === currentCountry) && (
            <FormField
              control={form.control}
              name="documentId"
              render={({ field }) => {
                const currentDocConfig = documentIDCountries.find(
                  (c) => c.id === currentCountry
                );

                const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const maskedValue = currentDocConfig!.mask(e.target.value);
                  field.onChange(maskedValue);
                };

                return (
                  <FormItem>
                    <FormLabel>Document ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={handleInput}
                        placeholder={currentDocConfig!.placeholder}
                        maxLength={currentDocConfig!.maxLength}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )}
          <Button type="submit" className="w-full">
            Pay
            <LockIcon />
          </Button>
        </form>
      </Form>

    </Card>
  )
}

export default PaymentForm
