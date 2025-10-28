export interface PaymentMethodLimit {
  id: string;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentMethodCode: string;
  minLimit: string | null;
  maxLimit: string | null;
  config: Record<string, any> | null;
  capabilities: Record<string, any> | null;
}

export interface ProviderCountryDetail {
  id: string;
  countryId: string;
  countryName: string;
  countryIsoCode: string;
  config: Record<string, any> | null;
  paymentMethods: PaymentMethodLimit[];
}

export interface ProviderDetails {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  countries: ProviderCountryDetail[];
}
