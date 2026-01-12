export interface Merchant {
  id: string;
  name: string;
  email: string | null;
  website: string | null;
  contactPerson: string | null;
  status: "active" | "inactive" | "suspended";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
