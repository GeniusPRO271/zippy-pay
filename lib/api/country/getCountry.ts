import { Country } from "@/lib/types/country";
import { axiosWithAuth } from "../config";

export async function getCountries(): Promise<Country[]> {
  const api = await axiosWithAuth()
  const { data } = await api.get<Country[]>('/api/countries')
  return data
}
