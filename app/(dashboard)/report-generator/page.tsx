"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Info,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import {
  CreateReportRequestSchema,
  type CreateReportRequest,
} from "@/lib/types/reports";


import type { Merchant } from "@/lib/types/merchant";
import type { MerchantFinanceOptions } from "@/lib/api/merchant/getMerchantFinanceOptions";
import { useCreateReport } from "@/hooks/report/createReport";
import { useMerchants } from "@/hooks/merchant/useMerchants";
import { useMerchantFinanceOptions } from "@/hooks/merchant/useMerchantFinanceOptions";

type PayMethodNode = { payMethodId: string; payMethodName: string };
type ProviderNode = {
  providerId: string;
  providerName: string;
  payMethods: PayMethodNode[];
};

type ProviderMethodFormValue = {
  payMethodId: string;
  payMethodName?: string;
  commissionFormula: string;
};

type ProviderFormValue = {
  providerId: string;
  providerName?: string;
  methods: ProviderMethodFormValue[];
};

type ReportFormValues = {
  reportType: "approvalRate" | "finance";
  reportName: string;
  dateRange: { from: string; to: string; timezone: string };
  reportParams?: {
    merchantId: string;
    countryId: string;
    earlyPayment?: string;
    retention?: string;
    pending?: string;
    providers: ProviderFormValue[];
  };
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

function FieldLabel({
  htmlFor,
  children,
  tooltip,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  tooltip: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function flattenErrors(
  errors: Record<string, unknown>,
): string[] {
  const messages: string[] = [];
  for (const key of Object.keys(errors)) {
    const val = errors[key];
    if (
      val &&
      typeof val === "object" &&
      "message" in val &&
      typeof (val as { message: unknown }).message === "string"
    ) {
      messages.push((val as { message: string }).message);
    } else if (val && typeof val === "object") {
      messages.push(
        ...flattenErrors(val as Record<string, unknown>),
      );
    }
  }
  return messages;
}

function DateTimePickerField(props: {
  name: "dateRange.from" | "dateRange.to";
  label: string;
  tooltip: string;
  disabled?: boolean;
  defaultTime: string;
}) {
  const { name, label, tooltip, disabled, defaultTime } = props;
  const { control } = useFormContext<ReportFormValues>();

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
            <FieldLabel tooltip={tooltip}>{label}</FieldLabel>

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
              <FieldError>{fieldState.error.message}</FieldError>
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
}) {
  const {
    merchants,
    merchantsLoading,
    merchantsError,
    financeOptions,
    financeOptionsLoading,
    financeOptionsError,
  } = props;

  const {
    control,
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext<ReportFormValues>();

  const [formulaCache, setFormulaCache] = React.useState<Record<string, string>>(
    {},
  );

  const merchantId = watch("reportParams.merchantId") ?? "";
  const countryId = watch("reportParams.countryId") ?? "";

  const selectedProviders =
    useWatch({
      control,
      name: "reportParams.providers",
    }) ?? [];

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

  function resetPayMethodsAndSelection() {
    setFormulaCache({});
    setValue("reportParams.providers", [], {
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

    const current = getValues("reportParams.providers") ?? [];

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
          (m: ProviderMethodFormValue) => m.payMethodId === method.payMethodId,
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

      setValue("reportParams.providers", next, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    if (providerIndex === -1) return;

    const existingProvider = next[providerIndex];
    const methods = [...(existingProvider.methods ?? [])];

    const methodIndex = methods.findIndex(
      (m: ProviderMethodFormValue) => m.payMethodId === method.payMethodId,
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

    setValue("reportParams.providers", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const financeErrors = errors;
  const providersErrorMsg =
    financeErrors?.reportParams?.providers?.message ??
    financeErrors?.reportParams?.providers?.root?.message;

  const merchantsErrorText =
    merchantsError && merchantsError instanceof Error
      ? merchantsError.message
      : merchantsError
        ? "Failed to load merchants."
        : "";

  const financeOptionsErrorText =
    financeOptionsError && financeOptionsError instanceof Error
      ? financeOptionsError.message
      : financeOptionsError
        ? "Failed to load finance options."
        : "";

  return (
    <Card className="border-dashed">
      <CardHeader className="space-y-1 bg-muted/40">
        <div className="text-sm font-semibold">Finance parameters</div>
        <div className="text-xs text-muted-foreground">
          Select merchant and country, then choose pay methods and enter commission formulas.
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 pt-6">
        {merchantsErrorText ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {merchantsErrorText}
          </div>
        ) : null}

        {financeOptionsErrorText ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {financeOptionsErrorText}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel tooltip="The merchant whose transactions will be included in this report">Merchant</FieldLabel>

            <Controller
              control={control}
              name="reportParams.merchantId"
              render={({ field }) => (
                <Select
                  value={field.value || NONE}
                  onValueChange={(v) => {
                    const nextMerchantId = v === NONE ? "" : v;
                    field.onChange(nextMerchantId);

                    setValue("reportParams.countryId", "", {
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
              <FieldError>{financeErrors.reportParams.merchantId.message}</FieldError>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FieldLabel tooltip="Country to filter transactions by">Country of operation</FieldLabel>

            <Controller
              control={control}
              name="reportParams.countryId"
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
              <FieldError>{financeErrors.reportParams.countryId.message}</FieldError>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <FieldLabel htmlFor="earlyPayment" tooltip="Amount deducted for early payment advances">Early payment (optional)</FieldLabel>
            <Input
              id="earlyPayment"
              inputMode="decimal"
              placeholder='e.g. "15000" or "15000.50"'
              {...register("reportParams.earlyPayment", {
                setValueAs: (v) => (v === "" ? undefined : v),
              })}
            />
            {financeErrors?.reportParams?.earlyPayment?.message ? (
              <FieldError>{financeErrors.reportParams.earlyPayment.message}</FieldError>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="retention" tooltip="Amount held as retention from the settlement">Retention (optional)</FieldLabel>
            <Input
              id="retention"
              inputMode="decimal"
              placeholder='e.g. "5000" or "5000.50"'
              {...register("reportParams.retention", {
                setValueAs: (v) => (v === "" ? undefined : v),
              })}
            />
            {financeErrors?.reportParams?.retention?.message ? (
              <FieldError>{financeErrors.reportParams.retention.message}</FieldError>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="pending" tooltip="Amount marked as pending in the settlement">Pending (optional)</FieldLabel>
            <Input
              id="pending"
              inputMode="decimal"
              placeholder='e.g. "5000" or "5000.50"'
              {...register("reportParams.pending", {
                setValueAs: (v) => (v === "" ? undefined : v),
              })}
            />
            {financeErrors?.reportParams?.pending?.message ? (
              <FieldError>{financeErrors.reportParams.pending.message}</FieldError>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <div className="flex items-center gap-1">
              <h4 className="text-sm font-semibold">
                Providers → Pay methods → Commission formulas
              </h4>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" type="button">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Formula guide</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Formula Guide</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h5 className="font-semibold mb-2">Basics</h5>
                      <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                        <li><span className="font-mono text-foreground">amount</span> — the transaction value</li>
                        <li><span className="font-mono text-foreground">=</span> — optional prefix (like Excel)</li>
                        <li><span className="font-mono text-foreground">,</span> — decimal separator (e.g. <span className="font-mono">1,5</span> = 1.5)</li>
                        <li><span className="font-mono text-foreground">;</span> — function argument separator</li>
                        <li><span className="font-mono text-foreground">%</span> — percentage (e.g. <span className="font-mono">1,7%</span> = 0.017)</li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h5 className="font-semibold mb-2">Available Functions</h5>
                      <div className="space-y-2 text-muted-foreground">
                        <div>
                          <span className="font-mono text-foreground">IF(condition;then;else)</span>
                          <p className="ml-4">Conditional: <span className="font-mono">=IF(amount&gt;1000;amount*2%;amount*3%)</span></p>
                        </div>
                        <div>
                          <span className="font-mono text-foreground">MIN(a;b)</span>
                          <p className="ml-4">Smallest value: <span className="font-mono">=MIN(amount*5%;1000)</span></p>
                        </div>
                        <div>
                          <span className="font-mono text-foreground">MAX(a;b)</span>
                          <p className="ml-4">Largest value: <span className="font-mono">=MAX(amount*1%;500)</span></p>
                        </div>
                        <div>
                          <span className="font-mono text-foreground">ABS(value)</span>
                          <p className="ml-4">Absolute value: <span className="font-mono">=ABS(amount*-1%)</span></p>
                        </div>
                        <div>
                          <span className="font-mono text-foreground">ROUND(value)</span>
                          <p className="ml-4">Round to integer: <span className="font-mono">=ROUND(amount*2,5%)</span></p>
                        </div>
                        <div>
                          <span className="font-mono text-foreground">SUM(a;b;...)</span>
                          <p className="ml-4">Sum values: <span className="font-mono">=SUM(amount*1%;amount*0,5%)</span></p>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h5 className="font-semibold mb-2">Examples</h5>
                      <div className="space-y-2">
                        <div className="rounded-md bg-muted p-2 font-mono text-xs">
                          =amount*3%
                          <p className="text-muted-foreground font-sans mt-1">Fixed 3% commission</p>
                        </div>
                        <div className="rounded-md bg-muted p-2 font-mono text-xs">
                          =IF(amount*1,7%&lt;650;650*1,19;amount*1,7%*1,19)
                          <p className="text-muted-foreground font-sans mt-1">1.7% with 650 minimum, plus 19% tax</p>
                        </div>
                        <div className="rounded-md bg-muted p-2 font-mono text-xs">
                          =MIN(amount*5%;2000)
                          <p className="text-muted-foreground font-sans mt-1">5% capped at 2000</p>
                        </div>
                        <div className="rounded-md bg-muted p-2 font-mono text-xs">
                          =MAX(amount*1%;500)
                          <p className="text-muted-foreground font-sans mt-1">1% with a 500 floor</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Select at least one pay method and enter an Excel-style formula using{" "}
              <span className="font-mono">amount</span> for the transaction value.
            </p>
          </div>

          {providersErrorMsg ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {providersErrorMsg}
            </div>
          ) : null}

          {selectedCountry && providers.length === 0 ? (
            <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
              No providers/pay methods available for this country.
            </div>
          ) : null}

          {selectedCountry &&
            providers.map((p) => (
              <Card key={p.providerId} className="overflow-hidden">
                <CardHeader className="bg-muted/40 py-4">
                  <div className="text-sm font-semibold">{p.providerName}</div>
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
                          className={cn(
                            "grid items-center gap-2",
                            isSelected
                              ? "md:grid-cols-[auto_1fr_2fr]"
                              : "md:grid-cols-[auto_1fr]",
                          )}
                        >
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

                          <div className="text-sm font-medium">
                            {m.payMethodName}
                          </div>

                          {isSelected && formulaName ? (
                            <div className="grid gap-1">
                              <Input
                                placeholder="e.g. =amount*3%"
                                {...register(formulaName)}
                              />
                              {formulaError ? (
                                <FieldError>{formulaError}</FieldError>
                              ) : null}
                            </div>
                          ) : null}
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
  const fromDefault = React.useMemo(
    () => formatLocalDatetimeValue(new Date(2026, 0, 1, 0, 0)),
    [],
  );
  const toDefault = React.useMemo(
    () => formatLocalDatetimeValue(new Date(2026, 0, 11, 23, 59)),
    [],
  );

  const form = useForm<ReportFormValues>({
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
    form.unregister("reportParams", {
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
    if (curr.reportParams) return;

    setValue(
      "reportParams",
      {
        merchantId: "",
        countryId: "",
        earlyPayment: undefined,
        retention: undefined,
        pending: undefined,
        providers: [],
      },
      { shouldDirty: false },
    );
  }, [isFinance, form, setValue]);

  const merchantId = watch("reportParams.merchantId") ?? "";

  const merchantsQuery = useMerchants();
  const financeOptionsQuery = useMerchantFinanceOptions(merchantId);

  const onSubmit = handleSubmit(
    async (values) => {
      const payload: CreateReportRequest = CreateReportRequestSchema.parse(values);
      await createReportMutation.mutateAsync(payload);
    },
    (errors) => {
      const messages = flattenErrors(errors as Record<string, unknown>);
      toast.error("Please fix the following errors", {
        description: messages.slice(0, 5).join("\n"),
      });
    },
  );

  return (
    <div>
      <div className="mx-auto max-w-6xl pb-10">
        <FormProvider {...form}>
          <main className="grid gap-6">
            <Card>
              <CardHeader className="space-y-1">
                <div className="text-lg font-semibold">Create report</div>
                <CardDescription>
                  Configure your report parameters below. Choose between an Approval Rate or Finance report type.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={onSubmit} className="grid gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <FieldLabel tooltip="Choose between Approval Rate (transaction success metrics) or Finance (settlement with commission formulas)">Report type</FieldLabel>

                      <Controller
                        control={control}
                        name="reportType"
                        render={({ field }) => (
                          <Tabs
                            value={field.value}
                            onValueChange={(v) => {
                              field.onChange(v);
                              if (v !== "finance") {
                                unregisterReportParams();
                              }
                            }}
                          >
                            <TabsList className="w-full">
                              <TabsTrigger
                                value="approvalRate"
                                disabled={createReportMutation.isPending}
                                className="flex-1"
                              >
                                Approval Rate
                              </TabsTrigger>
                              <TabsTrigger
                                value="finance"
                                disabled={createReportMutation.isPending}
                                className="flex-1"
                              >
                                Finance
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        )}
                      />

                      {formState.errors.reportType?.message ? (
                        <FieldError>{formState.errors.reportType.message}</FieldError>
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel htmlFor="reportName" tooltip="A descriptive name for this report, shown in the reports list">Report name</FieldLabel>
                      <Input
                        id="reportName"
                        maxLength={120}
                        placeholder="e.g. Finance Report - CL"
                        {...register("reportName")}
                        disabled={createReportMutation.isPending}
                      />
                      {formState.errors.reportName?.message ? (
                        <FieldError>{formState.errors.reportName.message}</FieldError>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <DateTimePickerField
                      name="dateRange.from"
                      label="From"
                      tooltip="Start date/time for the report period"
                      defaultTime="00:00"
                      disabled={createReportMutation.isPending}
                    />

                    <DateTimePickerField
                      name="dateRange.to"
                      label="To"
                      tooltip="End date/time for the report period"
                      defaultTime="23:59"
                      disabled={createReportMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Timezone:</span>
                    <Badge variant="secondary">America/Santiago</Badge>
                    <input type="hidden" {...register("dateRange.timezone")} />
                  </div>

                  {isFinance ? (
                    <FinanceParamsFields
                      merchants={merchantsQuery.data ?? []}
                      merchantsLoading={merchantsQuery.isLoading}
                      merchantsError={merchantsQuery.error}
                      financeOptions={financeOptionsQuery.data}
                      financeOptionsLoading={financeOptionsQuery.isLoading}
                      financeOptionsError={financeOptionsQuery.error}
                    />
                  ) : null}

                  <Separator />

                  <div className="flex items-center gap-4">
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
                    <p className="text-xs text-muted-foreground">
                      The report will be generated in the background and available in the reports list.
                    </p>
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
