import { downloadReport } from "@/lib/api/reportGenerator";
import { useQuery } from "@tanstack/react-query";

export function useDownloadReport(reportId: string) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: () => {
      return downloadReport(reportId);
    },
    enabled: !!reportId,
  });
}
