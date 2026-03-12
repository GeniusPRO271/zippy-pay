import { getCountries } from "@/lib/api/country/getCountry";
import { Country } from "@/lib/types/country";
import { useQuery } from "@tanstack/react-query";

export function useCountries() {
  return useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: getCountries,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

