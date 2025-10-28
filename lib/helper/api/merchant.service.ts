import { MerchantBaseInfo, MerchantConfigInfo, ProviderDataRow, ProviderInfo } from "@/lib/types/merchant";
import { aggregateProvidersData, fetchMerchantConfiguration, fetchMerchantProviderRelations, fetchMerchantWithCountry, transformMerchantBaseInfo, transformMerchantConfig } from "./merchant.helper";

export async function getMerchantBaseInfo(
  merchantId: string
): Promise<MerchantBaseInfo | null> {
  const [merchantData] = await fetchMerchantWithCountry(merchantId);
  return transformMerchantBaseInfo(merchantData);
}

/**
 * Gets merchant configuration (API keys, URLs)
 */
export async function getMerchantConfig(
  merchantId: string
): Promise<MerchantConfigInfo | null> {
  const [configData] = await fetchMerchantConfiguration(merchantId);
  return transformMerchantConfig(configData);
}

/**
 * Gets all provider data for a merchant (raw rows)
 */
export async function getMerchantProviderData(
  merchantId: string
): Promise<ProviderDataRow[]> {
  return (await fetchMerchantProviderRelations(merchantId)) as ProviderDataRow[];
}

/**
 * Aggregates provider data into nested structure
 */
export function aggregateProviderData(rows: ProviderDataRow[]): ProviderInfo[] {
  return aggregateProvidersData(rows);
}
