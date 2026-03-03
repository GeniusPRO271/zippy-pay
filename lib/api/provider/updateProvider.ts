import { Provider } from "@/lib/types/provider"
import { axiosWithAuth } from "../config"

export async function updateProvider(
  id: string,
  data: Partial<Omit<Provider, "id" | "createdAt" | "updatedAt">>
): Promise<Provider> {
  const api = await axiosWithAuth()
  const { data: updated } = await api.put<Provider>(
    `/api/providers/${id}`,
    data
  )
  return updated
}
