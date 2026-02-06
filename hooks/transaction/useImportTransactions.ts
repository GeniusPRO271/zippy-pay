import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { importTransactions } from "@/lib/api/transaction/importTransactions";
import type { ImportResult } from "@/lib/types/import";

type ImportToastCtx = {
  toastId: string | number;
};

export function useImportTransactions() {
  const queryClient = useQueryClient();

  return useMutation<
    ImportResult[],
    Error,
    Record<string, unknown>[],
    ImportToastCtx
  >({
    mutationFn: (transactions) => importTransactions(transactions),

    onMutate: (variables) => {
      const toastId = toast.loading(
        `Importing ${variables.length} transaction${variables.length === 1 ? "" : "s"}...`
      );
      return { toastId };
    },

    onSuccess: (results, _variables, ctx) => {
      if (ctx?.toastId != null) toast.dismiss(ctx.toastId);

      const successes = results.filter((r) => r.success).length;
      const duplicates = results.filter(
        (r) => !r.success && "skipped" in r && r.skipped
      ).length;
      const errors = results.filter(
        (r) => !r.success && !("skipped" in r && r.skipped)
      ).length;

      toast.success("Import complete", {
        description: `${successes} imported, ${duplicates} duplicates, ${errors} errors`,
      });

      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },

    onError: (error, _variables, ctx) => {
      if (ctx?.toastId != null) toast.dismiss(ctx.toastId);
      toast.error("Import failed", {
        description: error.message,
      });
    },
  });
}
