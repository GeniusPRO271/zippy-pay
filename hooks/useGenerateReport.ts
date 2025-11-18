import { createReport, CreateReportResponse } from '@/lib/api/reportGenerator';
import { CreateReportSchemaType } from '@/lib/zod/createReport';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner'; // ✅ Shadcn 2025 uses `sonner` for toasts

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation<CreateReportResponse, Error, CreateReportSchemaType>({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });

      toast.success('Report created successfully!', {
        description: `Your report has been queued for generation.`
      });
    },
    onError: (error) => {
      toast.error('Failed to create report', {
        description: error.message || 'An unexpected error occurred while generating the report.',
      });
    },
  });
}
