export interface CountryProviders {
  id: string;
  name: string;
  isoCode: string;
  currencyCode: string | null;
  providers: CountryProvider[];
}

export interface CountryProvider {
  id: string;
  name: string;
  description: string | null;
  methods: CountryProviderMethod[];
}

export interface CountryProviderMethod {
  id: string;
  name: string;
  code: string;
  minLimit: string | null;
  maxLimit: string | null;
  config: Record<string, any> | null;
}
