import { Merchant } from "@/lib/types/merchant";
import { axiosWithAuth } from "../config";

export async function getMerchants(): Promise<Merchant[]> {
  const api = await axiosWithAuth()
  const { data } = await api.get<Merchant[]>('/api/merchants')
  return data
}
