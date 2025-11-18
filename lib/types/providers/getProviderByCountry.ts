export interface ProviderWithCountries {
  provider: {
    id: string;
    name: string;
  };
  countries: ProviderCountries[];
}

export interface ProviderCountries {
  id: string;
  name: string;
  isoCode: string | null;
  methods: ProviderWithCountriesMethods[];
}


export interface ProviderWithCountriesMethods {
  id: string;
  name: string;
  code: string;
  minLimit: string | null;
  maxLimit: string | null;
}

