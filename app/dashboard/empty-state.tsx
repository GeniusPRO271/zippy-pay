"use client";

import {
  IconFolderCode,
  IconUpload,
  IconDatabase,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { BaseTransaction } from "@/lib/types/transaction";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useDashboardStats } from "@/hooks/statistics/useStats";
import { DashboardStatsType } from "@/lib/types/statistics";


interface FirestoreTimestamp {
  _seconds: number
  _nanoseconds: number
}


function convertFirestoreTimestamp(obj: unknown): string | unknown {
  if (!obj || typeof obj !== "object") return obj

  const candidate = obj as FirestoreTimestamp
  if (
    typeof candidate._seconds === "number" &&
    typeof candidate._nanoseconds === "number"
  ) {
    return new Date(
      candidate._seconds * 1000 + candidate._nanoseconds / 1_000_000
    ).toISOString()
  }

  return obj
}

function normalizeTransaction(t: Partial<BaseTransaction>): BaseTransaction {
  return {
    ...t,
    dateRequest: convertFirestoreTimestamp(t.dateRequest) as string,
  } as BaseTransaction
}

export function EmptyState({
  setTransactionsAction,
  setIsLoadingAction,
}: {
  setTransactionsAction: React.Dispatch<React.SetStateAction<DashboardStatsType | undefined>>;
  setIsLoadingAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setError(null);
    setIsLoadingAction(true);
    setProgress({ current: 0, total: files.length });

    const fileArray = Array.from(files);
    const allTransactions: BaseTransaction[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setProgress({ current: i + 1, total: fileArray.length });

        try {
          const transactions = await parseJSONFile(file);

          const BATCH_SIZE = 1000;
          for (let j = 0; j < transactions.length; j += BATCH_SIZE) {
            const batch = transactions.slice(j, j + BATCH_SIZE);
            allTransactions.push(...batch);

            if (j + BATCH_SIZE < transactions.length) {
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }
        } catch (err) {
          console.error(`[ERROR] Failed to parse ${file.name}:`, err);
          setError(`Failed to parse ${file.name}. Please ensure it's valid JSON.`);
        }
      }


      if (allTransactions.length === 0 && fileArray.length > 0) {
        setError("No valid transactions found in the uploaded files.");
      }
    } catch (err) {
      console.error("[ERROR] File import failed:", err);
      setError("An unexpected error occurred during import.");
    } finally {
      setIsLoadingAction(false);
      setProgress(null);
      event.target.value = "";
    }
  };

  const parseJSONFile = async (file: File): Promise<BaseTransaction[]> => {
    const text = await file.text();

    try {
      const parsed = JSON.parse(text);
      const array = Array.isArray(parsed) ? parsed : [parsed];
      const valid = array.filter((t) => t && typeof t === "object");

      return valid.map(normalizeTransaction);
    } catch (err) {
      try {
        const lines = text.split("\n").filter((l) => l.trim());
        const parsed = lines.map((l) => JSON.parse(l));
        const valid = parsed.filter((t) => t && typeof t === "object");

        return valid.map(normalizeTransaction);
      } catch {
        throw new Error(`Invalid JSON format in ${file.name}`);
      }
    }
  };


  const toDate = new Date();
  const fromDate = new Date(toDate);
  fromDate.setDate(toDate.getDate() - 30);

  const { data, isLoading, refetch } = useDashboardStats({
    merchantId: [],
    providerId: [],
    countryId: [],
    payMethodId: [],
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  });

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFolderCode />
        </EmptyMedia>
        <EmptyTitle>No Data Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t imported any transactions yet. Get started by importing your data or
          load sample data.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {progress && (
          <div className="mb-4 text-sm text-muted-foreground">
            Processing file {progress.current} of {progress.total}...
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            id="file-input"
            multiple
            className="hidden"
            onChange={handleFileImport}
          />

          <Button onClick={() => document.getElementById("file-input")?.click()}>
            Import Data
            <IconUpload className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            disabled={isLoading}
            onClick={() => {
              refetch().then((result) => {
                if (result.data) {
                  setTransactionsAction(result.data)
                }
              })
            }}
          >
            Load Real Data
            {isLoading ? <Spinner /> : <IconDatabase className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </EmptyContent>
    </Empty >
  );
}
