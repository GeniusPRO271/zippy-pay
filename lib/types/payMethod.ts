export interface PayMethod {
  id: string;
  name: string;
  displayName: string | null;
  category: "CARD" | "BANK_TRANSFER" | "WALLET" | "CRYPTO" | "CASH" | "LOCAL";
  providerId: string;
  countryId: string;
  providerCode: string | null;
  feePercent: string;
  fixedFee: string;
  isActive: boolean;
  createdAt: Date;
}
