import { axiosWithAuth } from "../config";

export type MerchantFinanceOptions = {
  merchantId: string;
  countries: Array<{
    countryId: string;
    countryName: string;
    countryIsoCode: string;
    providers: Array<{
      providerId: string;
      providerName: string;
      payMethods: Array<{
        payMethodId: string;
        payMethodName: string;
      }>;
    }>;
  }>;
};

export async function getMerchantFinanceOptions(
  id: string
): Promise<MerchantFinanceOptions> {
  const api = await axiosWithAuth()
  const { data } = await api.get<MerchantFinanceOptions>(
    `/api/merchants/${id}/finance-options`
  )
  return data
}
