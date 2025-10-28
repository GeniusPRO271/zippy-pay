"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { merchants } from "@/db/schema/merchants";
import { db } from "@/db";
import { Merchant, MerchantConfigDetails, MerchantFullInfo, MerchantWithCountry } from "@/lib/types/merchant";
import { countries } from "@/db/schema/countries";
import { merchantConfig } from "@/db/schema/merchantConfig";
import { merchantProviderMethods } from "@/db/schema/merchant_provider_methods";
import { providers } from "@/db/schema/providers";
import { paymentMethods } from "@/db/schema/payment_methods";
import { aggregateProviderData, getMerchantBaseInfo, getMerchantConfig, getMerchantProviderData } from "@/lib/helper/api/merchant.service";
import { CreateMerchantFormType } from "@/lib/zod/createMerchant";

export const getMerchants = async (): Promise<MerchantWithCountry[]> => {
  const data = await db
    .select({
      id: merchants.id,
      name: merchants.name,
      email: merchants.email,
      status: merchants.status,
      registeredCountryId: merchants.registeredCountryId,
      businessType: merchants.businessType,
      createdAt: merchants.createdAt,
      updatedAt: merchants.updatedAt,
      countryId: countries.id,
      countryName: countries.name,
      countryIsoCode: countries.isoCode,
    })
    .from(merchants)
    .leftJoin(countries, eq(countries.id, merchants.registeredCountryId));

  return data.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    status: m.status,
    registeredCountryId: m.registeredCountryId,
    businessType: m.businessType,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    country: {
      id: m.countryId!,
      name: m.countryName!,
      isoCode: m.countryIsoCode!,
    },
  }));
};

export async function getMerchantFullInfo(
  merchantId: string
): Promise<MerchantFullInfo | null> {
  // Fetch all data in parallel
  const [baseInfo, config, providerDataRows] = await Promise.all([
    getMerchantBaseInfo(merchantId),
    getMerchantConfig(merchantId),
    getMerchantProviderData(merchantId),
  ]);

  if (!baseInfo) {
    return null;
  }

  // Aggregate provider data
  const providers = aggregateProviderData(providerDataRows);

  return {
    ...baseInfo,
    config,
    providers,
  };
}

export async function createMerchant(formData: CreateMerchantFormType) {
  const { basicInfo, countries: countrySelection, providers } = formData;

  await db.transaction(async (tx) => {
    const merchantId = basicInfo.id ?? crypto.randomUUID();
    const registeredCountryId = countrySelection.countryIds[0];

    await tx.insert(merchants).values({
      id: merchantId,
      name: basicInfo.name,
      email: basicInfo.email,
      businessType: basicInfo.businessType,
      status: "active",
      registeredCountryId,
    });

    await tx.insert(merchantConfig).values({
      merchantId,
      apiKey: crypto.randomUUID(),
      callbackUrl: null,
      successUrl: null,
      failUrl: null,
      websiteUrl: null,
    });

    for (const provider of providers) {
      let countryId = registeredCountryId;
      for (const methodId of provider.paymentMethodIds) {
        await tx.insert(merchantProviderMethods).values({
          merchantId,
          countryId,
          providerId: provider.providerId,
          paymentMethodId: methodId,
          status: "enabled",
        });
      }
    }

    revalidatePath("/merchants");
  });
}

export const deleteMerchant = async (id: string) => {
  await db.delete(merchants).where(eq(merchants.id, id));

  revalidatePath("/merchants");
};

export const editMerchant = async (
  id: string,
  name?: string,
  email?: string,
  registeredCountryId?: string,
  businessType?: string
) => {
  await db
    .update(merchants)
    .set({
      ...(name && { name }),
      ...(email && { email }),
      ...(registeredCountryId && { registeredCountryId }),
      ...(businessType && { businessType }),
    })
    .where(eq(merchants.id, id));

  revalidatePath("/merchants");
};

export const toggleMerchantStatus = async (id: string) => {
  const merchantsData = await db
    .select({ status: merchants.status })
    .from(merchants)
    .where(eq(merchants.id, id))
    .limit(1);

  if (merchantsData.length === 0) return;

  const newStatus = merchantsData[0].status === "active" ? "inactive" : "active";

  await db
    .update(merchants)
    .set({ status: newStatus })
    .where(eq(merchants.id, id));

  revalidatePath("/merchants");
};

