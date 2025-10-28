import { db } from "@/db";
import { countries } from "@/db/schema/countries";
import { paymentMethods } from "@/db/schema/payment_methods";
import { providerCountryPaymentMethods } from "@/db/schema/provider_contry_payment_method";
import { providerCountries } from "@/db/schema/provider_countries";
import { providers } from "@/db/schema/providers";
import { Country, CountryWithProviders } from "@/lib/types/country";
import { eq } from "drizzle-orm";

export async function getAllCountries() {
  try {
    const result = await db.select().from(countries);
    return { success: true, data: result as Country[] };
  } catch (error) {
    console.error("Error fetching countries:", error);
    return { success: false, error: "Failed to fetch countries" };
  }
}


export async function getCountriesWithProviders(): Promise<{
  success: boolean;
  data?: CountryWithProviders[];
  error?: string;
}> {
  try {
    // Fetch all the related data
    const result = await db
      .select({
        countryId: countries.id,
        countryName: countries.name,
        providerId: providers.id,
        providerName: providers.name,
        paymentMethodId: paymentMethods.id,
        paymentMethodName: paymentMethods.name,
      })
      .from(countries)
      .leftJoin(providerCountries, eq(providerCountries.countryId, countries.id))
      .leftJoin(providers, eq(providers.id, providerCountries.providerId))
      .leftJoin(
        providerCountryPaymentMethods,
        eq(providerCountryPaymentMethods.providerCountryId, providerCountries.id)
      )
      .leftJoin(
        paymentMethods,
        eq(paymentMethods.id, providerCountryPaymentMethods.paymentMethodId)
      );

    // Transform flat data into nested structure
    const countryMap = new Map<string, CountryWithProviders>();

    for (const row of result) {
      if (!row.countryName) continue;

      // Get or create country
      if (!countryMap.has(row.countryName)) {
        countryMap.set(row.countryName, {
          countryId: row.countryId,
          countryName: row.countryName,
          providers: [],
        });
      }

      const country = countryMap.get(row.countryName)!;

      // Skip if no provider data
      if (!row.providerId || !row.providerName) continue;

      // Find or create provider
      let provider = country.providers.find(
        (p) => p.providerId === row.providerId
      );

      if (!provider) {
        provider = {
          providerId: row.providerId,
          providerName: row.providerName,
          methods: [],
        };
        country.providers.push(provider);
      }

      // Add payment method if exists and not already added
      if (row.paymentMethodId && row.paymentMethodName) {
        const methodExists = provider.methods.some(
          (m) => m.id === row.paymentMethodId
        );
        if (!methodExists) {
          provider.methods.push({
            id: row.paymentMethodId,
            name: row.paymentMethodName,
          });
        }
      }
    }

    const data = Array.from(countryMap.values());
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching countries with providers:", error);
    return { success: false, error: "Failed to fetch countries with providers" };
  }
}
