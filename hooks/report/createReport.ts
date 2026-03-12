import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { CreateReportRequest } from "@/lib/types/reports";
import { createReport, type ReportJob } from "@/lib/api/report/createReport";

type CreateReportToastCtx = {
  toastId: string | number;
};

export function useCreateReport() {
  return useMutation<ReportJob, Error, CreateReportRequest, CreateReportToastCtx>(
    {
      mutationFn: (reportData) => createReport(reportData),

      onMutate: () => {
        const toastId = toast.loading("Creating report...");
        return { toastId };
      },

      onSuccess: (job, _variables, ctx) => {
        if (ctx?.toastId != null) toast.dismiss(ctx.toastId);

        toast.success("Report created", {
          description: `Job id: ${job.id} • Status: ${job.status}`,
        });
      },

      onError: (error, _variables, ctx) => {
        if (ctx?.toastId != null) toast.dismiss(ctx.toastId);

        toast.error("Failed to create report", {
          description: error.message,
        });
      },
    },
  );
}
