import { getAllTransactions } from "@/lib/api/transactions";
import { useQuery } from "@tanstack/react-query";

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: getAllTransactions,
    refetchInterval: 100000,
  });
}
