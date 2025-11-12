"use server"

import { db } from "@/db";
import { eq } from "drizzle-orm"
import {
  providerCountryPaymentMethods,
  providerCountries,
  countries,
  providers,
  paymentMethods,
} from "@/db/schema";


export async function getAllCountriesWithProviders() {
  const allCountries = await db.select().from(countries);
  if (allCountries.length === 0) return [];

  const rows = await db
    .select({
      countryId: countries.id,
      countryName: countries.name,
      countryIso: countries.isoCode,
      countryCurrency: countries.currencyCode,
      providerId: providers.id,
      providerName: providers.name,
      providerDescription: providers.description,
      methodId: paymentMethods.id,
      methodName: paymentMethods.name,
      methodCode: paymentMethods.code,
      minLimit: providerCountryPaymentMethods.minLimit,
      maxLimit: providerCountryPaymentMethods.maxLimit,
      config: providerCountryPaymentMethods.config,
    })
    .from(providerCountries)
    .innerJoin(countries, eq(countries.id, providerCountries.countryId))
    .innerJoin(providers, eq(providerCountries.providerId, providers.id))
    .innerJoin(
      providerCountryPaymentMethods,
      eq(providerCountries.id, providerCountryPaymentMethods.providerCountryId)
    )
    .innerJoin(
      paymentMethods,
      eq(providerCountryPaymentMethods.paymentMethodId, paymentMethods.id)
    );

  const countryMap = new Map<string, any>();

  for (const row of rows) {
    if (!countryMap.has(row.countryId)) {
      countryMap.set(row.countryId, {
        id: row.countryId,
        name: row.countryName,
        isoCode: row.countryIso,
        currencyCode: row.countryCurrency,
        providers: new Map(),
      });
    }

    const country = countryMap.get(row.countryId);

    if (!country.providers.has(row.providerId)) {
      country.providers.set(row.providerId, {
        id: row.providerId,
        name: row.providerName,
        description: row.providerDescription,
        methods: [],
      });
    }

    const provider = country.providers.get(row.providerId);
    provider.methods.push({
      id: row.methodId,
      name: row.methodName,
      code: row.methodCode,
      minLimit: row.minLimit,
      maxLimit: row.maxLimit,
      config: row.config,
    });
  }

  return Array.from(countryMap.values()).map((c) => ({
    ...c,
    providers: Array.from(c.providers.values()),
  }));
}
