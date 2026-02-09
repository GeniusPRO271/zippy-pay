"use client";

import * as React from "react";
import { useCallback, useState, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  IconUpload,
  IconJson,
  IconCheck,
  IconAlertTriangle,
  IconX,
} from "@tabler/icons-react";
import { useImportTransactions } from "@/hooks/transaction/useImportTransactions";
import type { ImportSummary } from "@/lib/types/import";

type Phase = "idle" | "preview" | "results";

export function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [parsedData, setParsedData] = useState<Record<string, unknown>[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(
    null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportTransactions();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTimeout(() => {
        setPhase("idle");
        setParsedData([]);
        setFileError(null);
        setImportSummary(null);
        setIsDragOver(false);
        importMutation.reset();
      }, 200);
    }
  };

  const processFile = useCallback((file: File) => {
    setFileError(null);

    if (!file.name.endsWith(".json")) {
      setFileError("Only .json files are accepted.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!Array.isArray(json)) {
          setFileError("JSON must contain an array of transaction objects.");
          return;
        }
        if (json.length === 0) {
          setFileError("The file contains an empty array.");
          return;
        }
        setParsedData(json);
        setPhase("preview");
      } catch {
        setFileError("Invalid JSON. Please check the file format.");
      }
    };
    reader.onerror = () => setFileError("Failed to read file.");
    reader.readAsText(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleConfirmImport = () => {
    importMutation.mutate(parsedData, {
      onSuccess: (results) => {
        const summary: ImportSummary = {
          total: results.length,
          successes: results.filter((r) => r.success).length,
          duplicates: results.filter(
            (r) => !r.success && "skipped" in r && r.skipped
          ).length,
          errors: results.filter(
            (r) => !r.success && !("skipped" in r && r.skipped)
          ).length,
          results,
        };
        setImportSummary(summary);
        setPhase("results");
      },
    });
  };

  const previewStats = useMemo(() => {
    if (parsedData.length === 0) return null;
    const payins = parsedData.filter(
      (t) =>
        !t.type ||
        (typeof t.type === "string" && t.type.toUpperCase() !== "PAYOUT")
    ).length;
    const payouts = parsedData.length - payins;
    const merchants = new Set(
      parsedData.map((t) => t.merchantName as string)
    ).size;
    const countries = new Set(
      parsedData.map((t) => t.country as string)
    ).size;
    return { total: parsedData.length, payins, payouts, merchants, countries };
  }, [parsedData]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <IconUpload className="mr-1 size-4" />
          Import Data
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Upload a .json file containing an array of transaction objects.
          </DialogDescription>
        </DialogHeader>

        {/* IDLE: file drop zone */}
        {phase === "idle" && (
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <IconJson className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Drag and drop a <strong>.json</strong> file here, or click to
                browse
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
            {fileError && (
              <Alert variant="destructive" className="mt-3">
                <IconAlertTriangle className="size-4" />
                <AlertTitle>Invalid File</AlertTitle>
                <AlertDescription>{fileError}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* PREVIEW: data summary */}
        {phase === "preview" && previewStats && (
          <div className="space-y-4">
            <Alert>
              <IconJson className="size-4" />
              <AlertTitle>File Ready</AlertTitle>
              <AlertDescription>
                {previewStats.total} transactions parsed successfully.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Total Records</p>
                <p className="text-lg font-semibold">{previewStats.total}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Merchants</p>
                <p className="text-lg font-semibold">
                  {previewStats.merchants}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Pay-Ins</p>
                <p className="text-lg font-semibold">{previewStats.payins}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Pay-Outs</p>
                <p className="text-lg font-semibold">{previewStats.payouts}</p>
              </div>
              <div className="rounded-md border p-3 col-span-2">
                <p className="text-muted-foreground">Countries</p>
                <p className="text-lg font-semibold">
                  {previewStats.countries}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setPhase("idle");
                  setParsedData([]);
                }}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={importMutation.isPending}
                className="cursor-pointer"
              >
                {importMutation.isPending ? (
                  <>
                    <Spinner className="mr-1" />
                    Importing...
                  </>
                ) : (
                  <>
                    <IconUpload className="mr-1 size-4" />
                    Confirm Import
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* RESULTS: import outcome */}
        {phase === "results" && importSummary && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="default">
                <IconCheck className="size-3" />
                {importSummary.successes} Imported
              </Badge>
              <Badge variant="secondary">
                {importSummary.duplicates} Duplicates
              </Badge>
              {importSummary.errors > 0 && (
                <Badge variant="destructive">
                  <IconX className="size-3" />
                  {importSummary.errors} Errors
                </Badge>
              )}
            </div>

            <div className="max-h-[200px] overflow-y-auto rounded-md border text-xs">
              <table className="w-full">
                <thead className="sticky top-0 bg-background border-b">
                  <tr>
                    <th className="text-left p-2">commerceReqId</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {importSummary.results.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-2 font-mono">
                        {"commerceReqId" in r ? r.commerceReqId : "N/A"}
                      </td>
                      <td className="p-2">{"type" in r ? r.type : "?"}</td>
                      <td className="p-2">
                        {r.success ? (
                          <span className="text-green-600">Success</span>
                        ) : "skipped" in r && r.skipped ? (
                          <span className="text-yellow-600">Duplicate</span>
                        ) : (
                          <span className="text-red-600">
                            Error
                            {"error" in r && r.error
                              ? `: ${r.error.slice(0, 60)}`
                              : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPhase("idle");
                  setParsedData([]);
                  setImportSummary(null);
                }}
              >
                Import Another
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
