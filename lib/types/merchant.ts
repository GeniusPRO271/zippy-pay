import { PaymentMethodLimit } from "./provider";

export interface Country {
  id: string;
  name: string;
  isoCode: string;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  status: string;
  registeredCountryId: string;
  businessType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantWithCountry {
  id: string;
  name: string;
  email: string;
  status: string;
  registeredCountryId: string;
  businessType: string;
  createdAt: Date;
  updatedAt: Date;
  country: Country
}

export interface MerchantConfigDetails {
  id: string;
  apiKey: string;
  callbackUrl: string | null;
  successUrl: string | null;
  failUrl: string | null;
  websiteUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantBaseInfo {
  id: string;
  name: string;
  email: string;
  status: string;
  businessType: string;
  registeredCountryId: string;
  country: {
    id: string;
    name: string;
    isoCode: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantConfigInfo {
  id: string;
  apiKey: string;
  callbackUrl: string | null;
  successUrl: string | null;
  failUrl: string | null;
  websiteUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}


export interface CountryWithMethods {
  id: string;
  name: string;
  isoCode: string;
  paymentMethods: PaymentMethodLimit[];
}

export interface ProviderInfo {
  id: string;
  name: string;
  description: string | null;
  countries: CountryWithMethods[];
}

export interface MerchantFullInfo extends MerchantBaseInfo {
  config: MerchantConfigInfo | null;
  providers: ProviderInfo[];
}

export interface ProviderDataRow {
  providerId: string;
  providerName: string;
  providerDescription: string | null;
  countryId: string;
  countryName: string;
  countryIsoCode: string;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentMethodCode: string;
  paymentMethodStatus: string | null;
  paymentMethodMinLimit: string | null;
  paymentMethodMaxLimit: string | null;
}
