"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  Home,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CreateReportRequestSchema,
  type CreateReportRequest,
} from "@/lib/types/reports";


import type { Merchant } from "@/lib/types/merchant";
import type { MerchantFinanceOptions } from "@/lib/api/merchant/getMerchantFinanceOptions";
import { useCreateReport } from "@/hooks/report/createReport";
import { useMerchants } from "@/hooks/merchant/useMerchants";
import { useMerchantFinanceOptions } from "@/hooks/merchant/useMerchantFinanceOptions";

type CreateReportFormValues = z.input<typeof CreateReportRequestSchema>;

type PayMethodNode = { payMethodId: string; payMethodName: string };
type ProviderNode = {
  providerId: string;
  providerName: string;
  payMethods: PayMethodNode[];
};

const NONE = "__none__";

function formatLocalDatetimeValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}`;
}

function selectionKey(providerId: string, payMethodId: string) {
  return `${providerId}::${payMethodId}`;
}

function toYmd(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

function parseLocalDateTime(value?: string) {
  if (!value) return null;

  const [datePart, timePartRaw] = value.split("T");
  if (!datePart) return null;

  const [yStr, mStr, dStr] = datePart.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);

  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return null;
  }

  const date = new Date(y, m - 1, d);

  const timePart = timePartRaw?.trim() || "";
  const [hhRaw = "00", mmRaw = "00"] = timePart.split(":");
  const hh = String(hhRaw).padStart(2, "0").slice(0, 2);
  const mm = String(mmRaw).padStart(2, "0").slice(0, 2);

  return {
    date,
    time: `${hh}:${mm}`,
  };
}

function buildLocalDateTimeString(date: Date, timeHHmm: string) {
  const safeTime = /^\d{2}:\d{2}$/.test(timeHHmm) ? timeHHmm : "00:00";
  return `${toYmd(date)}T${safeTime}`;
}

function DateTimePickerField(props: {
  name: "dateRange.from" | "dateRange.to";
  label: string;
  disabled?: boolean;
  defaultTime: string;
}) {
  const { name, label, disabled, defaultTime } = props;
  const { control } = useFormContext<CreateReportFormValues>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const parsed = parseLocalDateTime(field.value);
        const selectedDate = parsed?.date;
        const selectedTime = parsed?.time ?? defaultTime;

        return (
          <div className="grid gap-2">
            <Label>{label}</Label>

            <div className="grid gap-2 md:grid-cols-[1fr_160px] md:items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      "justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => {
                      if (!d) return;
                      field.onChange(buildLocalDateTimeString(d, selectedTime));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Input
                type="time"
                value={selectedTime}
                disabled={disabled}
                onChange={(e) => {
                  const nextTime = e.target.value;
                  const dateToUse = selectedDate ?? new Date();
                  field.onChange(buildLocalDateTimeString(dateToUse, nextTime));
                }}
              />
            </div>

            {fieldState.error?.message ? (
              <p className="text-xs text-red-600">{fieldState.error.message}</p>
            ) : null}
          </div>
        );
      }}
    />
  );
}

function FinanceParamsFields(props: {
  merchants: Merchant[];
  merchantsLoading: boolean;
  merchantsError: unknown;

  financeOptions: MerchantFinanceOptions | undefined;
  financeOptionsLoading: boolean;
  financeOptionsError: unknown;
  refetchFinanceOptions: () => void;
}) {
  const {
    merchants,
    merchantsLoading,
    merchantsError,
    financeOptions,
    financeOptionsLoading,
    financeOptionsError,
    refetchFinanceOptions,
  } = props;

  const {
    control,
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext<CreateReportFormValues>();

  const [payMethodsLoaded, setPayMethodsLoaded] = React.useState(false);
  const [formulaCache, setFormulaCache] = React.useState<Record<string, string>>(
    {},
  );

  const merchantId =
    (watch("reportParams.merchantId" as any) as string | undefined) ?? "";
  const countryId =
    (watch("reportParams.countryId" as any) as string | undefined) ?? "";
  const from = watch("dateRange.from");
  const to = watch("dateRange.to");

  const selectedProviders =
    (useWatch({
      control,
      name: "reportParams.providers" as any,
    }) as any[] | undefined) ?? [];

  const countries = React.useMemo(() => {
    const list = financeOptions?.countries ?? [];
    return [...list].sort((a, b) =>
      (a.countryName || "").localeCompare(b.countryName || ""),
    );
  }, [financeOptions]);

  const selectedCountry = React.useMemo(() => {
    if (!countryId) return null;
    return (
      (financeOptions?.countries ?? []).find((c) => c.countryId === countryId) ??
      null
    );
  }, [financeOptions, countryId]);

  const providers = React.useMemo(() => {
    const list = selectedCountry?.providers ?? [];
    return [...list].sort((a, b) =>
      (a.providerName || "").localeCompare(b.providerName || ""),
    );
  }, [selectedCountry]);

  const canLoadPayMethods = Boolean(
    merchantId && countryId && from && to && !financeOptionsLoading,
  );

  function resetPayMethodsAndSelection() {
    setPayMethodsLoaded(false);
    setFormulaCache({});
    setValue("reportParams.providers" as any, [], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  React.useEffect(() => {
    resetPayMethodsAndSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId, countryId]);

  function findSelectedMethod(
    providerId: string,
    payMethodId: string,
  ): { providerIndex: number; methodIndex: number } | null {
    for (let pi = 0; pi < selectedProviders.length; pi += 1) {
      const p = selectedProviders[pi];
      if (p?.providerId !== providerId) continue;

      const methods = p?.methods ?? [];
      for (let mi = 0; mi < methods.length; mi += 1) {
        if (methods[mi]?.payMethodId === payMethodId) {
          return { providerIndex: pi, methodIndex: mi };
        }
      }
    }
    return null;
  }

  function toggleMethod(args: {
    provider: ProviderNode;
    method: PayMethodNode;
    checked: boolean;
  }) {
    const { provider, method, checked } = args;

    const current =
      ((getValues("reportParams.providers" as any) as any[]) ?? []) as any[];

    const next = [...current];
    const providerIndex = next.findIndex(
      (p) => p.providerId === provider.providerId,
    );

    const cacheKey = selectionKey(provider.providerId, method.payMethodId);

    if (checked) {
      const seedFormula = formulaCache[cacheKey] ?? "";

      if (providerIndex === -1) {
        next.push({
          providerId: provider.providerId,
          providerName: provider.providerName,
          methods: [
            {
              payMethodId: method.payMethodId,
              payMethodName: method.payMethodName,
              commissionFormula: seedFormula,
            },
          ],
        });
      } else {
        const existingProvider = next[providerIndex];
        const methods = [...(existingProvider.methods ?? [])];

        const exists = methods.some(
          (m: any) => m.payMethodId === method.payMethodId,
        );
        if (!exists) {
          methods.push({
            payMethodId: method.payMethodId,
            payMethodName: method.payMethodName,
            commissionFormula: seedFormula,
          });
        }

        next[providerIndex] = {
          ...existingProvider,
          providerName: existingProvider.providerName ?? provider.providerName,
          methods,
        };
      }

      setValue("reportParams.providers" as any, next, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    if (providerIndex === -1) return;

    const existingProvider = next[providerIndex];
    const methods = [...(existingProvider.methods ?? [])];

    const methodIndex = methods.findIndex(
      (m: any) => m.payMethodId === method.payMethodId,
    );
    if (methodIndex === -1) return;

    const removed = methods[methodIndex];
    setFormulaCache((prev) => ({
      ...prev,
      [cacheKey]: removed?.commissionFormula ?? prev[cacheKey] ?? "",
    }));

    methods.splice(methodIndex, 1);

    if (methods.length === 0) {
      next.splice(providerIndex, 1);
    } else {
      next[providerIndex] = { ...existingProvider, methods };
    }

    setValue("reportParams.providers" as any, next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const financeErrors = errors as any;
  const providersErrorMsg =
    financeErrors?.reportParams?.providers?.message ??
    financeErrors?.reportParams?.providers?.root?.message;

  const merchantsErrorText =
    merchantsError && (merchantsError as any)?.message
      ? String((merchantsError as any).message)
      : merchantsError
        ? "Failed to load merchants."
        : "";

  const financeOptionsErrorText =
    financeOptionsError && (financeOptionsError as any)?.message
      ? String((financeOptionsError as any).message)
      : financeOptionsError
        ? "Failed to load finance options."
        : "";

  return (
    <Card className="border-dashed">
      <CardHeader className="space-y-1 bg-muted/40">
        <div className="text-sm font-semibold">Finance parameters</div>
        <div className="text-xs text-muted-foreground">
          Select merchant → country → date range → load pay methods → select
          methods and write commission formulas.
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 pt-6">
        {merchantsErrorText ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {merchantsErrorText}
          </div>
        ) : null}

        {financeOptionsErrorText ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {financeOptionsErrorText}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Merchant</Label>

            <Controller
              control={control}
              name={"reportParams.merchantId" as any}
              render={({ field }) => (
                <Select
                  value={field.value || NONE}
                  onValueChange={(v) => {
                    const nextMerchantId = v === NONE ? "" : v;
                    field.onChange(nextMerchantId);

                    setValue("reportParams.countryId" as any, "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });

                    resetPayMethodsAndSelection();
                  }}
                  disabled={merchantsLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        merchantsLoading
                          ? "Loading merchants..."
                          : "Select a merchant..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Select a merchant...</SelectItem>
                    {merchants.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {financeErrors?.reportParams?.merchantId?.message ? (
              <p className="text-xs text-red-600">
                {financeErrors.reportParams.merchantId.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label>Country of operation</Label>

            <Controller
              control={control}
              name={"reportParams.countryId" as any}
              render={({ field }) => (
                <Select
                  value={field.value || NONE}
                  onValueChange={(v) => {
                    field.onChange(v === NONE ? "" : v);
                    resetPayMethodsAndSelection();
                  }}
                  disabled={!merchantId || financeOptionsLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !merchantId
                          ? "Select a merchant first..."
                          : financeOptionsLoading
                            ? "Loading countries..."
                            : "Select a country..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Select a country...</SelectItem>
                    {countries.map((c) => (
                      <SelectItem key={c.countryId} value={c.countryId}>
                        {c.countryName} ({c.countryIsoCode || ""})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {financeErrors?.reportParams?.countryId?.message ? (
              <p className="text-xs text-red-600">
                {financeErrors.reportParams.countryId.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="earlyPayment">Early payment (optional)</Label>
            <Input
              id="earlyPayment"
              inputMode="decimal"
              placeholder='e.g. "15000" or "15000.50"'
              {...register("reportParams.earlyPayment" as any, {
                setValueAs: (v) => (v === "" ? undefined : v),
              })}
            />
            {financeErrors?.reportParams?.earlyPayment?.message ? (
              <p className="text-xs text-red-600">
                {financeErrors.reportParams.earlyPayment.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="retention">Retention (optional)</Label>
            <Input
              id="retention"
              inputMode="decimal"
              placeholder='e.g. "5000" or "5000.50"'
              {...register("reportParams.retention" as any, {
                setValueAs: (v) => (v === "" ? undefined : v),
              })}
            />
            {financeErrors?.reportParams?.retention?.message ? (
              <p className="text-xs text-red-600">
                {financeErrors.reportParams.retention.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={!merchantId || financeOptionsLoading}
            onClick={() => {
              resetPayMethodsAndSelection();
              refetchFinanceOptions();
            }}
          >
            Reload finance options
          </Button>

          <Button
            type="button"
            disabled={!canLoadPayMethods}
            onClick={() => setPayMethodsLoaded(true)}
          >
            Load pay methods
          </Button>
        </div>

        <div className="grid gap-3">
          <div>
            <h4 className="text-sm font-semibold">
              Providers → Pay methods → Commission formulas
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Select at least one pay method and enter a formula. Must include{" "}
              <span className="font-mono">amount</span>.
            </p>
          </div>

          {providersErrorMsg ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {providersErrorMsg}
            </div>
          ) : null}

          {!payMethodsLoaded ? (
            <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
              Click “Load pay methods” to display providers and pay methods.
            </div>
          ) : null}

          {payMethodsLoaded && !selectedCountry ? (
            <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
              Select a country to see pay methods.
            </div>
          ) : null}

          {payMethodsLoaded && selectedCountry && providers.length === 0 ? (
            <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
              No providers/pay methods available for this country.
            </div>
          ) : null}

          {payMethodsLoaded &&
            selectedCountry &&
            providers.map((p) => (
              <Card key={p.providerId} className="overflow-hidden">
                <CardHeader className="bg-muted/40 py-4">
                  <div>
                    <div className="text-sm font-semibold">{p.providerName}</div>
                    <div className="mt-1 font-mono text-xs text-muted-foreground">
                      {p.providerId}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="grid gap-3 pt-6">
                  {[...p.payMethods]
                    .sort((a, b) =>
                      (a.payMethodName || "").localeCompare(b.payMethodName || ""),
                    )
                    .map((m) => {
                      const selectedInfo = findSelectedMethod(
                        p.providerId,
                        m.payMethodId,
                      );

                      const isSelected = Boolean(selectedInfo);

                      const formulaName = selectedInfo
                        ? (`reportParams.providers.${selectedInfo.providerIndex}.methods.${selectedInfo.methodIndex}.commissionFormula` as const)
                        : null;

                      const formulaError =
                        selectedInfo != null
                          ? financeErrors?.reportParams?.providers?.[
                            selectedInfo.providerIndex
                          ]?.methods?.[selectedInfo.methodIndex]
                            ?.commissionFormula?.message
                          : null;

                      return (
                        <div
                          key={m.payMethodId}
                          className="grid gap-2 md:grid-cols-[auto_1fr_2fr] md:items-center"
                        >
                          <div className="pt-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                toggleMethod({
                                  provider: p,
                                  method: m,
                                  checked: checked === true,
                                });
                              }}
                            />
                          </div>

                          <div>
                            <div className="text-sm font-medium">
                              {m.payMethodName}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">
                              {m.payMethodId}
                            </div>
                          </div>

                          <div className="grid gap-1">
                            <div className="text-xs text-muted-foreground">
                              Commission formula (required if selected)
                            </div>

                            {isSelected && formulaName ? (
                              <>
                                <Input
                                  placeholder="e.g. amount * 0.03"
                                  {...register(formulaName as any)}
                                />
                                {formulaError ? (
                                  <p className="text-xs text-red-600">
                                    {formulaError}
                                  </p>
                                ) : null}
                              </>
                            ) : (
                              <Input
                                placeholder="e.g. amount * 0.03"
                                disabled
                                value=""
                                readOnly
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportGeneratorRHF() {
  const router = useRouter();

  const fromDefault = React.useMemo(
    () => formatLocalDatetimeValue(new Date(2026, 0, 1, 0, 0)),
    [],
  );
  const toDefault = React.useMemo(
    () => formatLocalDatetimeValue(new Date(2026, 0, 11, 23, 59)),
    [],
  );

  const form = useForm<CreateReportFormValues>({
    resolver: zodResolver(CreateReportRequestSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldUnregister: true,
    defaultValues: {
      reportType: "approvalRate",
      reportName: "",
      dateRange: {
        from: fromDefault,
        to: toDefault,
        timezone: "America/Santiago",
      },
    },
  });

  const { control, register, handleSubmit, watch, setValue, formState } = form;

  const reportType = watch("reportType");
  const isFinance = reportType === "finance";

  const createReportMutation = useCreateReport();

  const unregisterReportParams = React.useCallback(() => {
    form.unregister("reportParams" as any, {
      keepValue: false,
      keepDefaultValue: false,
      keepDirty: false,
      keepTouched: false,
      keepError: false,
    });
  }, [form]);

  React.useEffect(() => {
    if (reportType !== "finance") {
      unregisterReportParams();
    }
  }, [reportType, unregisterReportParams]);

  React.useEffect(() => {
    if (!isFinance) return;

    const curr = form.getValues();
    if ((curr as any).reportParams) return;

    setValue(
      "reportParams" as any,
      {
        merchantId: "",
        countryId: "",
        earlyPayment: undefined,
        retention: undefined,
        providers: [],
      },
      { shouldDirty: false },
    );
  }, [isFinance, form, setValue]);

  const merchantId =
    (watch("reportParams.merchantId" as any) as string | undefined) ?? "";

  const merchantsQuery = useMerchants();
  const financeOptionsQuery = useMerchantFinanceOptions(merchantId);

  function renderError(msg?: unknown) {
    if (!msg || typeof msg !== "string") return null;
    return <p className="text-xs text-red-600">{msg}</p>;
  }

  const onSubmit = handleSubmit(async (values) => {
    const payload: CreateReportRequest = CreateReportRequestSchema.parse(values);
    await createReportMutation.mutateAsync(payload);
  });

  return (
    <div className="min-h-screen">
      <div className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex items-center gap-2 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="cursor-pointer"
            aria-label="Go back"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            className="cursor-pointer"
            variant="outline"
            size="icon"
            aria-label="Home"
            onClick={() => router.push("/")}
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-20">
        <header className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Report Generator
          </h1>
        </header>

        <FormProvider {...form}>
          <main className="grid gap-6">
            <Card>
              <CardHeader className="space-y-1">
                <div className="grid gap-1">
                  <div className="text-lg font-semibold">Create report</div>
                  <div className="text-sm text-muted-foreground">
                    Supported report types: approvalRate, finance
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={onSubmit} className="grid gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Report type</Label>

                      <Controller
                        control={control}
                        name="reportType"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(v) => {
                              field.onChange(v);

                              if (v !== "finance") {
                                unregisterReportParams();
                              }
                            }}
                            disabled={createReportMutation.isPending}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select report type..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approvalRate">
                                approvalRate
                              </SelectItem>
                              <SelectItem value="finance">finance</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />

                      {renderError((formState.errors as any)?.reportType?.message)}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="reportName">Report name</Label>
                      <Input
                        id="reportName"
                        maxLength={120}
                        placeholder="e.g. Finance Report - CL"
                        {...register("reportName")}
                        disabled={createReportMutation.isPending}
                      />
                      {renderError(formState.errors.reportName?.message)}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <DateTimePickerField
                      name="dateRange.from"
                      label="From (Chile time)"
                      defaultTime="00:00"
                      disabled={createReportMutation.isPending}
                    />

                    <DateTimePickerField
                      name="dateRange.to"
                      label="To (Chile time)"
                      defaultTime="23:59"
                      disabled={createReportMutation.isPending}
                    />

                    <div className="grid gap-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        readOnly
                        {...register("dateRange.timezone")}
                      />
                      {renderError(formState.errors.dateRange?.timezone?.message)}
                    </div>
                  </div>

                  {isFinance ? (
                    <FinanceParamsFields
                      merchants={merchantsQuery.data ?? []}
                      merchantsLoading={merchantsQuery.isLoading}
                      merchantsError={merchantsQuery.error}
                      financeOptions={financeOptionsQuery.data}
                      financeOptionsLoading={financeOptionsQuery.isLoading}
                      financeOptionsError={financeOptionsQuery.error}
                      refetchFinanceOptions={() => financeOptionsQuery.refetch()}
                    />
                  ) : null}

                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      disabled={createReportMutation.isPending}
                    >
                      {createReportMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create report"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </main>
        </FormProvider>
      </div>
    </div>
  );
}
