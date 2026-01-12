export interface Provider {
  id: string;
  name: string;
  category: "PSP" | "BANK" | "AGGREGATOR" | "WALLET" | "CRYPTO_GATEWAY";
  logoUrl: string | null;
  headquartersCountry: string | null;
  status: "active" | "inactive" | "maintenance";
  priority: number | null;
  createdAt: Date;
  updatedAt: Date;
}
