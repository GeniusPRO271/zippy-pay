import { getUsers, User } from "@/lib/api/user/users";
import { useQuery } from "@tanstack/react-query";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
