import { db } from "@/db";
import { eq } from "drizzle-orm";
import { countries } from "@/db/schema/countries";
import { merchantProviderMethods } from "@/db/schema/merchant_provider_methods";
import { merchantConfig } from "@/db/schema/merchantConfig";
import { merchants } from "@/db/schema/merchants";
import { paymentMethods } from "@/db/schema/payment_methods";
import { providerCountries } from "@/db/schema/provider_countries";
import { providers } from "@/db/schema/providers";
import { CountryWithMethods, MerchantBaseInfo, MerchantConfigInfo, ProviderDataRow, ProviderInfo } from "@/lib/types/merchant";
import { providerCountryPaymentMethods } from "@/db/schema/provider_contry_payment_method";

export async function fetchMerchantWithCountry(merchantId: string) {
  return await db
    .select({
      id: merchants.id,
      name: merchants.name,
      email: merchants.email,
      status: merchants.status,
      registeredCountryId: merchants.registeredCountryId,
      businessType: merchants.businessType,
      createdAt: merchants.createdAt,
      updatedAt: merchants.updatedAt,
      country: {
        id: countries.id,
        name: countries.name,
        isoCode: countries.isoCode,
      },
    })
    .from(merchants)
    .leftJoin(countries, eq(merchants.registeredCountryId, countries.id))
    .where(eq(merchants.id, merchantId));
}

/**
 * Fetches merchant configuration (API keys, URLs)
 */
export async function fetchMerchantConfiguration(merchantId: string) {
  return await db
    .select({
      id: merchantConfig.id,
      apiKey: merchantConfig.apiKey,
      callbackUrl: merchantConfig.callbackUrl,
      successUrl: merchantConfig.successUrl,
      failUrl: merchantConfig.failUrl,
      websiteUrl: merchantConfig.websiteUrl,
      createdAt: merchantConfig.createdAt,
      updatedAt: merchantConfig.updatedAt,
    })
    .from(merchantConfig)
    .where(eq(merchantConfig.merchantId, merchantId));
}

/**
 * Fetches all provider, country, and payment method data for a merchant
 * Includes the status and limits from merchant_provider_methods and provider_country_payment_methods
 */
export async function fetchMerchantProviderRelations(merchantId: string) {
  return await db
    .select({
      providerId: providers.id,
      providerName: providers.name,
      providerDescription: providers.description,
      countryId: countries.id,
      countryName: countries.name,
      countryIsoCode: countries.isoCode,
      countryConfig: providerCountries.config,
      paymentMethodId: paymentMethods.id,
      paymentMethodName: paymentMethods.name,
      paymentMethodCode: paymentMethods.code,
      paymentMethodStatus: merchantProviderMethods.status,
      paymentMethodMinLimit: providerCountryPaymentMethods.minLimit,
      paymentMethodMaxLimit: providerCountryPaymentMethods.maxLimit,
      paymentMethodConfig: providerCountryPaymentMethods.config,
      paymentMethodCapabilities: paymentMethods.capabilities,
    })
    .from(merchantProviderMethods)
    .innerJoin(providers, eq(merchantProviderMethods.providerId, providers.id))
    .innerJoin(countries, eq(countries.id, merchantProviderMethods.countryId))
    .innerJoin(
      providerCountries,
      eq(providerCountries.providerId, providers.id)
    )
    .innerJoin(
      paymentMethods,
      eq(paymentMethods.id, merchantProviderMethods.paymentMethodId)
    )
    .innerJoin(
      providerCountryPaymentMethods,
      eq(providerCountryPaymentMethods.paymentMethodId, paymentMethods.id)
    )
    .where(eq(merchantProviderMethods.merchantId, merchantId));
}

// ════════════════════════════════════════════════════════════════
// DATA TRANSFORMATION - Business Logic Layer
// ════════════════════════════════════════════════════════════════

/**
 * Transforms raw merchant data into a clean base info object
 */
export function transformMerchantBaseInfo(merchantData: any): MerchantBaseInfo | null {
  if (!merchantData) return null;

  return {
    id: merchantData.id,
    name: merchantData.name,
    email: merchantData.email,
    status: merchantData.status,
    businessType: merchantData.businessType,
    registeredCountryId: merchantData.registeredCountryId,
    country: merchantData.country,
    createdAt: merchantData.createdAt,
    updatedAt: merchantData.updatedAt,
  };
}

/**
 * Transforms raw config data into a clean config object
 */
export function transformMerchantConfig(configData: any): MerchantConfigInfo | null {
  if (!configData) return null;

  return {
    id: configData.id,
    apiKey: configData.apiKey,
    callbackUrl: configData.callbackUrl,
    successUrl: configData.successUrl,
    failUrl: configData.failUrl,
    websiteUrl: configData.websiteUrl,
    createdAt: configData.createdAt,
    updatedAt: configData.updatedAt,
  };
}

/**
 * Finds or creates a provider in the providers map
 */
export function getOrCreateProvider(
  providersMap: Map<string, ProviderInfo>,
  providerId: string,
  providerName: string,
  providerDescription: string | null
): ProviderInfo {
  let provider = providersMap.get(providerId);

  if (!provider) {
    provider = {
      id: providerId,
      name: providerName,
      description: providerDescription,
      countries: [],
    };
    providersMap.set(providerId, provider);
  }

  return provider;
}

/**
 * Finds or creates a country within a provider
 */
export function getOrCreateCountry(
  provider: ProviderInfo,
  countryId: string,
  countryName: string,
  countryIsoCode: string,
  countryConfig: Record<string, any> | null
): CountryWithMethods {
  let country = provider.countries.find((c) => c.id === countryId);

  if (!country) {
    country = {
      id: countryId,
      name: countryName,
      isoCode: countryIsoCode,
      config: countryConfig,
      paymentMethods: [],
    };
    provider.countries.push(country);
  }

  return country;
}

/**
 * Adds a payment method to a country if it doesn't already exist
 */
export function addPaymentMethodIfUnique(
  country: CountryWithMethods,
  paymentMethodId: string,
  paymentMethodName: string,
  paymentMethodCode: string,
  paymentMethodStatus: string | null,
  paymentMethodMinLimit: string | null,
  paymentMethodMaxLimit: string | null,
  paymentMethodConfig: Record<string, any> | null,
  paymentMethodCapabilities: Record<string, any> | null
): void {
  const methodExists = country.paymentMethods.some(
    (pm) => pm.id === paymentMethodId
  );

  if (!methodExists) {
    country.paymentMethods.push({
      id: paymentMethodId,
      paymentMethodId: paymentMethodId,
      paymentMethodName: paymentMethodName,
      paymentMethodCode: paymentMethodCode,
      minLimit: paymentMethodMinLimit,
      maxLimit: paymentMethodMaxLimit,
      config: paymentMethodConfig,
      capabilities: paymentMethodCapabilities,
    });
  }
}

/**
 * Aggregates flat provider data rows into nested structure:
 * Provider → Country → Payment Methods
 */
export function aggregateProvidersData(rows: ProviderDataRow[]): ProviderInfo[] {
  const providersMap = new Map<string, ProviderInfo>();

  for (const row of rows) {
    // Get or create provider
    const provider = getOrCreateProvider(
      providersMap,
      row.providerId,
      row.providerName,
      row.providerDescription
    );

    // Get or create country within provider
    const country = getOrCreateCountry(
      provider,
      row.countryId,
      row.countryName,
      row.countryIsoCode,
      row.countryConfig
    );

    // Add payment method if not already present
    addPaymentMethodIfUnique(
      country,
      row.paymentMethodId,
      row.paymentMethodName,
      row.paymentMethodCode,
      row.paymentMethodStatus,
      row.paymentMethodMinLimit,
      row.paymentMethodMaxLimit,
      row.paymentMethodConfig,
      row.paymentMethodCapabilities
    );
  }

  return Array.from(providersMap.values());
}
