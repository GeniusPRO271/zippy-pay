export interface PaymentMethodLimit {
  id: string;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentMethodCode: string;
  minLimit: string | null;
  maxLimit: string | null;
}

export interface ProviderCountryDetail {
  id: string;
  countryId: string;
  countryName: string;
  countryIsoCode: string;
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
