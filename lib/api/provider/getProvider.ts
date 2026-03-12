import { Provider } from "@/lib/types/provider"
import { axiosWithAuth } from "../config"


export async function getProviders(): Promise<Provider[]> {
  const api = await axiosWithAuth()
  const { data } = await api.get<Provider[]>('/api/providers')
  return data
}
