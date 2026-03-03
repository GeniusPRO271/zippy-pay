import { Merchant } from "@/lib/types/merchant"
import { axiosWithAuth } from "../config"

export async function updateMerchant(
  id: string,
  data: { name?: string }
): Promise<Merchant> {
  const api = await axiosWithAuth()
  const { data: updated } = await api.put<Merchant>(
    `/api/merchants/${id}`,
    data
  )
  return updated
}
