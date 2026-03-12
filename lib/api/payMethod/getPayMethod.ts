import { PayMethod } from "@/lib/types/payMethod"
import { axiosWithAuth } from "../config"

export async function getPayMethods(): Promise<PayMethod[]> {
  const api = await axiosWithAuth()
  const { data } = await api.get<PayMethod[]>('/api/paymethods')
  return data
}
