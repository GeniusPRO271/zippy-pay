import { getAllReports } from "@/lib/api/reportGenerator";
import { useQuery } from "@tanstack/react-query";

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: getAllReports,
    refetchInterval: 10000,
  });
}
