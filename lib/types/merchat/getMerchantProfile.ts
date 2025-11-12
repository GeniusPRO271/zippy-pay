export interface MerchantProfile {
  id: string;
  name: string;
  email: string;
  status: string;
  businessType: string;
  registeredCountryId: string;

  providers: MerchantProvider[];
}

export interface MerchantProvider {
  id: string;
  name: string;
  countries: MerchantProviderCountry[];
}

export interface MerchantProviderCountry {
  id: string;
  name: string;
  isoCode: string;
  methods: MerchantProviderMethod[];
}

export interface MerchantProviderMethod {
  id: string;
  name: string;
  minLimit: string | null; // numeric fields come back as string in Postgres
  maxLimit: string | null;
}
