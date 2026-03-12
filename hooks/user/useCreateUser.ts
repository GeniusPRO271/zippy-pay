import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createUser, CreateUserParams, User } from "@/lib/api/user/users";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, CreateUserParams>({
    mutationFn: (params) => createUser(params),
    onSuccess: (user) => {
      toast.success("User created", {
        description: `${user.email} has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error("Failed to create user", {
        description: error.message,
      });
    },
  });
}
