import { db } from "@/db";
import {
  providerCountryPaymentMethods,
  providerCountries,
  countries,
  providers,
  paymentMethods,
} from "@/db/schema";
import { PaymentMethodLimit, ProviderCountryDetail, ProviderDetails } from "@/lib/types/provider";
import { eq } from "drizzle-orm";

export async function getProviderById(
  providerId: string
): Promise<ProviderDetails | null> {
  // 1. Fetch provider base info
  const provider = await db
    .select()
    .from(providers)
    .where(eq(providers.id, providerId))
    .limit(1);

  if (!provider.length) {
    return null;
  }

  // 2. Fetch provider countries with country details
  const providerCountriesData = await db
    .select({
      id: providerCountries.id,
      countryId: countries.id,
      countryName: countries.name,
      countryIsoCode: countries.isoCode,
      config: providerCountries.config,
    })
    .from(providerCountries)
    .innerJoin(countries, eq(providerCountries.countryId, countries.id))
    .where(eq(providerCountries.providerId, providerId));

  // 3. Fetch all payment methods for this provider with their country limits
  const paymentMethodsData = await db
    .select({
      providerCountryId: providerCountryPaymentMethods.providerCountryId,
      id: providerCountryPaymentMethods.id,
      paymentMethodId: paymentMethods.id,
      paymentMethodName: paymentMethods.name,
      paymentMethodCode: paymentMethods.code,
      minLimit: providerCountryPaymentMethods.minLimit,
      maxLimit: providerCountryPaymentMethods.maxLimit,
      config: providerCountryPaymentMethods.config,
      capabilities: paymentMethods.capabilities,
    })
    .from(providerCountryPaymentMethods)
    .innerJoin(
      paymentMethods,
      eq(providerCountryPaymentMethods.paymentMethodId, paymentMethods.id)
    )
    .where(eq(paymentMethods.id, providerId));

  // 4. Group payment methods by provider country
  const paymentMethodsByCountry = paymentMethodsData.reduce((acc, pm) => {
    if (!acc[pm.providerCountryId]) {
      acc[pm.providerCountryId] = [];
    }
    acc[pm.providerCountryId].push({
      id: pm.id,
      paymentMethodId: pm.paymentMethodId,
      paymentMethodName: pm.paymentMethodName,
      paymentMethodCode: pm.paymentMethodCode,
      minLimit: pm.minLimit,
      maxLimit: pm.maxLimit,
      config: pm.config as Record<string, any> | null,
      capabilities: pm.capabilities as Record<string, any> | null,
    });
    return acc;
  }, {} as Record<string, PaymentMethodLimit[]>);

  // 5. Build the final structure
  const countriesDetail: ProviderCountryDetail[] = providerCountriesData.map(
    (pc) => ({
      id: pc.id,
      countryId: pc.countryId,
      countryName: pc.countryName,
      countryIsoCode: pc.countryIsoCode,
      config: pc.config as Record<string, any> | null,
      paymentMethods: paymentMethodsByCountry[pc.id] || [],
    })
  );

  return {
    id: provider[0].id,
    name: provider[0].name,
    description: provider[0].description,
    createdAt: provider[0].createdAt,
    updatedAt: provider[0].updatedAt,
    countries: countriesDetail,
  };
}
