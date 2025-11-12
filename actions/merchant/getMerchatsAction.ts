"use server"

import { db } from "@/db";
import { merchants, countries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAllMerchantsBasic() {
  const result = await db
    .select({
      id: merchants.id,
      name: merchants.name,
      email: merchants.email,
      status: merchants.status,
      businessType: merchants.businessType,
      countryId: countries.id,
      countryName: countries.name,
      countryIsoCode: countries.isoCode,
    })
    .from(merchants)
    .innerJoin(
      countries,
      eq(merchants.registeredCountryId, countries.id)
    );

  // structure response cleanly
  return result.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    status: m.status,
    businessType: m.businessType,
    registeredCountry: {
      id: m.countryId,
      name: m.countryName,
      isoCode: m.countryIsoCode,
    },
  }));
}
