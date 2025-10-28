export interface Country {
  id: string;
  name: string;
  isoCode: string;
}

export interface PaymentMethod {
  id: string
  name: string
}

export interface Provider {
  providerId: string
  providerName: string
  methods: PaymentMethod[]
}

export interface CountryWithProviders {
  countryId: string
  countryName: string
  providers: Provider[]
}

