import { Banknote, CreditCard, Landmark, LucideIcon } from "lucide-react";

export interface PaymentMethod {
  id: "bankCard" | "bankTransfer" | "cash";
  label: string;
  icon: LucideIcon;
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: "bankCard",
    label: "Card",
    icon: CreditCard,
  },
  {
    id: "bankTransfer",
    label: "Bank",
    icon: Landmark,
  },
  {
    id: "cash",
    label: "Cash",
    icon: Banknote,
  },
];
