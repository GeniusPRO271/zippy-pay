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
  IconTrash,
  IconFile,
} from "@tabler/icons-react";
import { useImportTransactions } from "@/hooks/transaction/useImportTransactions";
import type { ImportSummary } from "@/lib/types/import";

type Phase = "idle" | "preview" | "results";
type ParsedFile = { name: string; data: Record<string, unknown>[] };
type FileError = { name: string; error: string };

export function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [fileErrors, setFileErrors] = useState<FileError[]>([]);
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
        setParsedFiles([]);
        setFileErrors([]);
        setImportSummary(null);
        setIsDragOver(false);
        importMutation.reset();
      }, 200);
    }
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.name.endsWith(".json"));
    const nonJsonFiles = Array.from(files).filter(
      (f) => !f.name.endsWith(".json")
    );

    const errors: FileError[] = nonJsonFiles.map((f) => ({
      name: f.name,
      error: "Only .json files are accepted.",
    }));

    if (fileArray.length === 0) {
      setFileErrors(errors.length > 0 ? errors : [{ name: "", error: "No .json files selected." }]);
      return;
    }

    let completed = 0;
    const results: ParsedFile[] = [];

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (!Array.isArray(json)) {
            errors.push({
              name: file.name,
              error: "JSON must contain an array of transaction objects.",
            });
          } else if (json.length === 0) {
            errors.push({ name: file.name, error: "File contains an empty array." });
          } else {
            results.push({ name: file.name, data: json });
          }
        } catch {
          errors.push({ name: file.name, error: "Invalid JSON format." });
        }

        completed++;
        if (completed === fileArray.length) {
          setFileErrors(errors);
          if (results.length > 0) {
            setParsedFiles((prev) => [...prev, ...results]);
            setPhase("preview");
          }
        }
      };
      reader.onerror = () => {
        errors.push({ name: file.name, error: "Failed to read file." });
        completed++;
        if (completed === fileArray.length) {
          setFileErrors(errors);
          if (results.length > 0) {
            setParsedFiles((prev) => [...prev, ...results]);
            setPhase("preview");
          }
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const removeFile = (index: number) => {
    setParsedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setPhase("idle");
        setFileErrors([]);
      }
      return next;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset so the same files can be re-selected
    e.target.value = "";
  };

  const mergedData = useMemo(
    () => parsedFiles.flatMap((f) => f.data),
    [parsedFiles]
  );

  const handleConfirmImport = () => {
    importMutation.mutate(mergedData, {
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
    if (mergedData.length === 0) return null;
    const payins = mergedData.filter(
      (t) =>
        !t.type ||
        (typeof t.type === "string" && t.type.toUpperCase() !== "PAYOUT")
    ).length;
    const payouts = mergedData.length - payins;
    const merchants = new Set(
      mergedData.map((t) => t.merchantName as string)
    ).size;
    const countries = new Set(
      mergedData.map((t) => t.country as string)
    ).size;
    return { total: mergedData.length, payins, payouts, merchants, countries };
  }, [mergedData]);

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
            Upload one or more .json files containing arrays of transaction
            objects.
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
                Drag and drop <strong>.json</strong> files here, or click to
                browse
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            {fileErrors.length > 0 && (
              <Alert variant="destructive" className="mt-3">
                <IconAlertTriangle className="size-4" />
                <AlertTitle>Invalid File{fileErrors.length > 1 ? "s" : ""}</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    {fileErrors.map((fe, i) => (
                      <li key={i}>
                        {fe.name ? <strong>{fe.name}:</strong> : null} {fe.error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* PREVIEW: data summary */}
        {phase === "preview" && previewStats && (
          <div className="space-y-4">
            <Alert>
              <IconJson className="size-4" />
              <AlertTitle>
                {parsedFiles.length} File{parsedFiles.length > 1 ? "s" : ""}{" "}
                Ready
              </AlertTitle>
              <AlertDescription>
                {previewStats.total} transactions parsed successfully.
              </AlertDescription>
            </Alert>

            {/* Per-file breakdown (collapsed after 5) */}
            <div className="space-y-1.5">
              {parsedFiles.slice(0, 2).map((pf, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <IconFile className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{pf.name}</span>
                    <Badge variant="secondary" className="shrink-0">
                      {pf.data.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 cursor-pointer"
                    onClick={() => removeFile(i)}
                  >
                    <IconTrash className="size-3.5" />
                  </Button>
                </div>
              ))}
              {parsedFiles.length > 2 && (
                <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm bg-muted/50">
                  <div className="flex items-center gap-2">
                    <IconFile className="size-4 shrink-0 text-muted-foreground" />
                    <Badge variant="secondary">
                      +{parsedFiles.length - 2} more file
                      {parsedFiles.length - 2 > 1 ? "s" : ""} (
                      {parsedFiles
                        .slice(2)
                        .reduce((sum, f) => sum + f.data.length, 0)
                        .toLocaleString()}{" "}
                      records)
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 cursor-pointer"
                    onClick={() => {
                      setParsedFiles([]);
                      setPhase("idle");
                      setFileErrors([]);
                    }}
                  >
                    <IconTrash className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Add more files */}
            <Button
              variant="outline"
              size="sm"
              className="w-full cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconUpload className="mr-1 size-4" />
              Add More Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {fileErrors.length > 0 && (
              <Alert variant="destructive">
                <IconAlertTriangle className="size-4" />
                <AlertTitle>Skipped Files</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    {fileErrors.map((fe, i) => (
                      <li key={i}>
                        {fe.name ? <strong>{fe.name}:</strong> : null} {fe.error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

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
                  setParsedFiles([]);
                  setFileErrors([]);
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
                  setParsedFiles([]);
                  setFileErrors([]);
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
