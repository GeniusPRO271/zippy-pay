import { db } from "@/db"; // your drizzle instance
import {
  merchants,
  countries,
  merchantProviderMethods,
  providerCountryPaymentMethods,
  providerCountries,
  providers,
  paymentMethods,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getMerchantProfile(merchantId: string) {
  const merchant = await db.query.merchants.findFirst({
    where: eq(merchants.id, merchantId),
    with: {
      registeredCountry: true, // Changed from registeredCountryId
    },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  const merchantRelations = await db
    .select({
      providerId: providers.id,
      providerName: providers.name,
      countryId: countries.id,
      countryName: countries.name,
      countryIso: countries.isoCode,
      methodId: paymentMethods.id,
      methodName: paymentMethods.name,
      minLimit: providerCountryPaymentMethods.minLimit,
      maxLimit: providerCountryPaymentMethods.maxLimit,
    })
    .from(merchantProviderMethods)
    .innerJoin(
      providerCountryPaymentMethods,
      eq(
        merchantProviderMethods.providerCountryPaymentMethodId,
        providerCountryPaymentMethods.id
      )
    )
    .innerJoin(
      providerCountries,
      eq(providerCountryPaymentMethods.providerCountryId, providerCountries.id)
    )
    .innerJoin(providers, eq(providerCountries.providerId, providers.id))
    .innerJoin(countries, eq(providerCountries.countryId, countries.id))
    .innerJoin(
      paymentMethods,
      eq(providerCountryPaymentMethods.paymentMethodId, paymentMethods.id)
    )
    .where(eq(merchantProviderMethods.merchantId, merchantId));

  const providersMap = new Map<string, any>();

  for (const row of merchantRelations) {
    if (!providersMap.has(row.providerId)) {
      providersMap.set(row.providerId, {
        id: row.providerId,
        name: row.providerName,
        countries: new Map(),
      });
    }

    const provider = providersMap.get(row.providerId);
    if (!provider.countries.has(row.countryId)) {
      provider.countries.set(row.countryId, {
        id: row.countryId,
        name: row.countryName,
        isoCode: row.countryIso,
        methods: [],
      });
    }

    provider.countries.get(row.countryId).methods.push({
      id: row.methodId,
      name: row.methodName,
      minLimit: row.minLimit,
      maxLimit: row.maxLimit,
    });
  }

  const providersArray = Array.from(providersMap.values()).map((p) => ({
    ...p,
    countries: Array.from(p.countries.values()),
  }));

  const profile = {
    id: merchant.id,
    name: merchant.name,
    email: merchant.email,
    status: merchant.status,
    businessType: merchant.businessType,
    registeredCountryId: merchant.registeredCountryId,
    providers: providersArray,
  };

  return profile;
}
