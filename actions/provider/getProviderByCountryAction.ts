"use server";

import { db } from "@/db";
import {
  providers,
  providerCountries,
  providerCountryPaymentMethods,
  paymentMethods,
  countries,
} from "@/db/schema";
import { ProviderWithCountries } from "@/lib/types/providers/getProviderByCountry";
import { eq } from "drizzle-orm";

export async function getProviderCountries(
  providerId: string
): Promise<ProviderWithCountries> {
  const rows = await db
    .select({
      providerId: providers.id,
      providerName: providers.name,
      countryId: countries.id,
      countryName: countries.name,
      countryIso: countries.isoCode,
      methodId: paymentMethods.id,
      methodName: paymentMethods.name,
      methodCode: paymentMethods.code,
      minLimit: providerCountryPaymentMethods.minLimit,
      maxLimit: providerCountryPaymentMethods.maxLimit,
      config: providerCountryPaymentMethods.config,
    })
    .from(providerCountries)
    .innerJoin(providers, eq(providerCountries.providerId, providers.id))
    .innerJoin(countries, eq(providerCountries.countryId, countries.id))
    .innerJoin(
      providerCountryPaymentMethods,
      eq(providerCountries.id, providerCountryPaymentMethods.providerCountryId)
    )
    .innerJoin(
      paymentMethods,
      eq(providerCountryPaymentMethods.paymentMethodId, paymentMethods.id)
    )
    .where(eq(providerCountries.providerId, providerId));

  if (rows.length === 0) {
    return {
      provider: { id: providerId, name: "" },
      countries: [],
    };
  }

  const provider = {
    id: rows[0].providerId,
    name: rows[0].providerName,
  };

  const countryMap = new Map<string, any>();

  for (const row of rows) {
    if (!countryMap.has(row.countryId)) {
      countryMap.set(row.countryId, {
        id: row.countryId,
        name: row.countryName,
        isoCode: row.countryIso,
        methods: [],
      });
    }

    countryMap.get(row.countryId).methods.push({
      id: row.methodId,
      name: row.methodName,
      code: row.methodCode,
      minLimit: row.minLimit,
      maxLimit: row.maxLimit,
      config: row.config,
    });
  }

  return {
    provider,
    countries: Array.from(countryMap.values()),
  };
}
