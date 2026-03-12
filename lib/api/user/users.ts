import { axiosWithAuth } from "../config";

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: "superadmin" | "user";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserParams = {
  email: string;
  password: string;
  name?: string;
  role?: "superadmin" | "user";
};

export async function getUsers(): Promise<User[]> {
  const api = await axiosWithAuth();
  const { data } = await api.get<User[]>("/api/users");
  return data;
}

export async function createUser(params: CreateUserParams): Promise<User> {
  const api = await axiosWithAuth();
  const { data } = await api.post<User>("/api/users", params);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  const api = await axiosWithAuth();
  await api.delete(`/api/users/${id}`);
}
