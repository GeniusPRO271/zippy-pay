"use client";

import * as React from "react";
import type { BaseTransaction } from "@/lib/types/transaction";

interface UseFinancialWorkerOptions {
  transactions: BaseTransaction[];
  dateRange: {
    dateRange: { from?: Date; to?: Date };
    originalDateRange: { from?: Date; to?: Date };
  };
}

export function useFinancialReportWorker({
  transactions,
  dateRange,
}: UseFinancialWorkerOptions) {
  const [loading, setLoading] = React.useState(false);
  const [uniqueMerchantNames, setUniqueMerchantNames] =
    React.useState<string[]>([]);

  const workerRef = React.useRef<Worker | null>(null);
  const dataRef = React.useRef<BaseTransaction[]>([]);
  const initializedRef = React.useRef(false);

  // Keep raw transactions in a ref (no re-renders)
  React.useEffect(() => {
    dataRef.current = transactions;
  }, [transactions]);

  // 1) Create worker ONCE
  React.useEffect(() => {
    const worker = new Worker(
      new URL("./analyticsWorker.js", import.meta.url),
      { type: "module" }
    );
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const { data } = event;

      if (data.type === "financial-result") {
        const { merchants } = data;

        setUniqueMerchantNames(merchants);
        setLoading(false);
      }

      if (data.type === "error") {
        console.error("[Worker Error]:", data.message);
        setLoading(false);
      }
    };

    worker.onerror = (e) => {
      console.error("[Worker crashed]:", e);
      setLoading(false);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;
    if (!transactions || transactions.length === 0) return;

    // If same dataset length and already initialized, skip
    // (optional optimization; you can remove if your dataset truly changes)
    if (initializedRef.current) return;

    const length = transactions.length;

    const timestamps = new Float64Array(length);
    const quantities = new Float32Array(length);
    const statuses = new Uint8Array(length);
    const countryIndex = new Uint16Array(length);
    const methodIndex = new Uint16Array(length);
    const providerIndex = new Uint16Array(length);
    const merchantIndex = new Uint16Array(length);

    const countries: string[] = [];
    const methods: string[] = [];
    const providers: string[] = [];
    const merchants: string[] = [];

    const countryMap = new Map<string, number>();
    const methodMap = new Map<string, number>();
    const providerMap = new Map<string, number>();
    const merchantMap = new Map<string, number>();

    for (let i = 0; i < length; i++) {
      const t = transactions[i];

      const ts = t.dateRequest
        ? new Date(t.dateRequest).getTime()
        : typeof t.request_timestamp === "number"
          ? t.request_timestamp
          : 0

      timestamps[i] = ts;
      quantities[i] = Number(t.quantity || 0);
      statuses[i] = t.status === "ok" ? 1 : t.status === "pending" ? 0 : 2;

      // country
      const countryKey = t.country ?? "";
      let cIdx = countryMap.get(countryKey);
      if (cIdx === undefined) {
        cIdx = countries.length;
        countries.push(countryKey);
        countryMap.set(countryKey, cIdx);
      }
      countryIndex[i] = cIdx;

      // method
      const methodKey = t.payMethod ?? "";
      let mIdx = methodMap.get(methodKey);
      if (mIdx === undefined) {
        mIdx = methods.length;
        methods.push(methodKey);
        methodMap.set(methodKey, mIdx);
      }
      methodIndex[i] = mIdx;

      // provider
      const providerKey = t.provider ?? "";
      let pIdx = providerMap.get(providerKey);
      if (pIdx === undefined) {
        pIdx = providers.length;
        providers.push(providerKey);
        providerMap.set(providerKey, pIdx);
      }
      providerIndex[i] = pIdx;

      // merchant
      const merchantKey = t.merchantName ?? "";
      let meIdx = merchantMap.get(merchantKey);
      if (meIdx === undefined) {
        meIdx = merchants.length;
        merchants.push(merchantKey);
        merchantMap.set(merchantKey, meIdx);
      }
      merchantIndex[i] = meIdx;
    }

    worker.postMessage(
      {
        type: "init",
        length,
        timestamps: timestamps.buffer,
        quantities: quantities.buffer,
        statuses: statuses.buffer,
        countryIndex: countryIndex.buffer,
        methodIndex: methodIndex.buffer,
        providerIndex: providerIndex.buffer,
        merchantIndex: merchantIndex.buffer,
        countries,
        methods,
        providers,
        merchants,
      },
      [
        timestamps.buffer,
        quantities.buffer,
        statuses.buffer,
        countryIndex.buffer,
        methodIndex.buffer,
        providerIndex.buffer,
        merchantIndex.buffer,
      ]
    );

    initializedRef.current = true;
  }, [transactions]);

  // 3) Recompute financial data when date range changes
  React.useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;
    if (!initializedRef.current) return;

    const from =
      dateRange.dateRange.from ??
      dateRange.originalDateRange.from ??
      undefined;

    const to =
      dateRange.dateRange.to ??
      dateRange.originalDateRange.to ??
      undefined;

    if (!from || !to) return;

    setLoading(true);

    worker.postMessage({
      type: "compute-financial",
      from: from.getTime(),
      to: to.getTime(),
    });
  }, [dateRange.dateRange.from, dateRange.dateRange.to, dateRange.originalDateRange.from, dateRange.originalDateRange.to]);

  return {
    loading,
    uniqueMerchantNames,
  };
}
