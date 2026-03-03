import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateMerchant } from "@/lib/api/merchant/updateMerchant"
import { Merchant } from "@/lib/types/merchant"

export function useUpdateMerchant() {
  const queryClient = useQueryClient()

  return useMutation<Merchant, Error, { id: string; data: { name?: string } }>({
    mutationFn: ({ id, data }) => updateMerchant(id, data),
    onSuccess: (merchant) => {
      toast.success("Merchant updated", {
        description: `${merchant.name} has been updated successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: ["merchants"] })
    },
    onError: (error) => {
      toast.error("Failed to update merchant", {
        description: error.message,
      })
    },
  })
}
