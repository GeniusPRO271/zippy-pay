import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateProvider } from "@/lib/api/provider/updateProvider"
import { Provider } from "@/lib/types/provider"

export function useUpdateProvider() {
  const queryClient = useQueryClient()

  return useMutation<
    Provider,
    Error,
    { id: string; data: Partial<Omit<Provider, "id" | "createdAt" | "updatedAt">> }
  >({
    mutationFn: ({ id, data }) => updateProvider(id, data),
    onSuccess: (provider) => {
      toast.success("Provider updated", {
        description: `${provider.name} has been updated successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: ["providers"] })
    },
    onError: (error) => {
      toast.error("Failed to update provider", {
        description: error.message,
      })
    },
  })
}
