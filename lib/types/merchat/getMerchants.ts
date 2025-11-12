export interface MerchantBasic {
  id: string;
  name: string;
  email: string;
  status: string;
  businessType: string;
  registeredCountry: {
    id: string;
    name: string;
    isoCode: string;
  };
}
