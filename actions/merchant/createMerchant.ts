"use server"
import { db } from "@//db";
import {
  merchants,
  merchantProviderMethods,
  providerCountryPaymentMethods,
  providerCountries,
  countries,
} from "@/db/schema";
import { CreateMerchantFormType } from "@/lib/zod/createMerchant";
import { eq, and, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export async function createMerchant(data: CreateMerchantFormType) {
  const { basicInfo, countries: countrySelection, providers } = data;

  const [merchant] = await db
    .insert(merchants)
    .values({
      id: basicInfo.id ?? uuidv4(),
      name: basicInfo.name,
      email: basicInfo.email,
      businessType: basicInfo.businessType,
      registeredCountryId: countrySelection.countryIds[0],
    })
    .returning();

  const allCountries = await db
    .select()
    .from(countries)
    .where(inArray(countries.id, countrySelection.countryIds));

  for (const provider of providers) {
    const matchedCountry = allCountries.find(
      (c) => c.name === provider.countryName
    );
    if (!matchedCountry) continue;

    const providerCountry = await db
      .select()
      .from(providerCountries)
      .where(
        and(
          eq(providerCountries.providerId, provider.providerId),
          eq(providerCountries.countryId, matchedCountry.id)
        )
      )
      .limit(1);

    if (providerCountry.length === 0) continue;

    const providerCountryId = providerCountry[0].id;

    const methods = await db
      .select()
      .from(providerCountryPaymentMethods)
      .where(
        and(
          eq(providerCountryPaymentMethods.providerCountryId, providerCountryId),
          inArray(
            providerCountryPaymentMethods.paymentMethodId,
            provider.paymentMethodIds
          )
        )
      );

    if (methods.length === 0) continue;

    await db.insert(merchantProviderMethods).values(
      methods.map((method) => ({
        merchantId: merchant.id,
        providerCountryPaymentMethodId: method.id,
      }))
    );
  }

  return merchant;
}
