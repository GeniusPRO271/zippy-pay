import StatusBadge from "@/components/dashboard/table/statusBadge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { STATUS_CONFIG } from "./providerStatusConfig"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { notFound } from "next/navigation"
import { getProviderById } from "@/actions/providerActions"
import { PaymentMethodLimit, ProviderCountryDetail } from "@/lib/types/provider"
import { CountryWithMethods, ProviderInfo } from "@/lib/types/merchant"
import { MerchantProvider, MerchantProviderCountry } from "@/lib/types/merchat/getMerchantProfile"
import { getProviderCountries } from "@/actions/provider/getProviderByCountryAction"
import { ProviderCountries, ProviderWithCountriesMethods } from "@/lib/types/providers/getProviderByCountry"

async function ProviderDetailsSheet({ children, providerID, providersMerchants }: { children: React.ReactNode, providerID: string, providersMerchants: MerchantProvider }) {
  const provider = await getProviderCountries(providerID)

  if (!provider) {
    notFound();
  }

  provider.countries.forEach((providerCountry) => {
    // Find the matching country in the merchants array
    const merchantCountry = providersMerchants.countries.find((mc) => {
      console.log(
        `[DEBUG] Comparing Provider country ID: ${providerCountry.name} with Merchant country ID: ${mc.id}`
      );
      return mc.id === providerCountry.id;
    });

    if (!merchantCountry) {
      console.log(
        `[DEBUG] No matching merchant country for: ${providerCountry.name} (Provider country ID: ${providerCountry.id})`
      );
      return;
    }

    // Compare methods
    providerCountry.methods.forEach((providerMethod) => {
      const merchantMethod = merchantCountry.methods.find(
        (m) => m.name === providerMethod.name
      );

      const existsInMerchant = !!merchantMethod;

      console.log(
        `[DEBUG] Provider method "${providerMethod.name}" `
      );
    });
  });

  return (
    <Sheet>
      <SheetTrigger className="flex ">
        {children}
      </SheetTrigger>
      <SheetContent className="min-w-[500px]">
        <SheetHeader>
          <SheetTitle>
            <div className="flex gap-2">
              <h4 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                {provider.provider.name}
              </h4>
            </div>
          </SheetTitle>
          <SheetDescription>
            View this providers available methods, and current connection status by country thogheter with thier min-max amount for transactions.
          </SheetDescription>
          <div className="flex mt-5 gap-5 flex-col">
            {provider.countries.map((country) => {
              const merchantCountry = providersMerchants.countries.find(
                (mc) => mc.id === country.id
              );

              if (!merchantCountry) return null; // skip rendering if not found

              return (
                <MethodStatusTable
                  key={country.id}
                  merchantCountryMethods={merchantCountry}
                  countryMethods={country}
                />
              );
            })}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet >
  )
}


function MethodStatusTable({ countryMethods, merchantCountryMethods }: { countryMethods: ProviderCountries, merchantCountryMethods: MerchantProviderCountry }) {
  console.log(countryMethods, merchantCountryMethods)
  return (
    <div>
      <h4 className="scroll-m-20 text-normal font-semibold tracking-tight">
        {countryMethods.name}
      </h4>
      <Table className="mb-4 max-w-[400px]">
        <TableHeader>
          <TableRow>
            <TableHead className="text-sm">Method</TableHead>
            <TableHead className="">Status</TableHead>
            <TableHead className="">Min-Max</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {countryMethods?.methods?.map((method) => {
            console.log("Rendering method:", method.name);

            console.log(merchantCountryMethods)
            const isConnected = merchantCountryMethods?.methods?.some((pm) => {
              const comparison = pm.name === method.name;
              console.log(`Comparing ${pm.name} === ${method.name} → ${comparison}`);
              return comparison;
            });

            console.log(`Result for ${method.name}: ${isConnected}`);

            return (
              <TableRow key={method.id}>
                <TableCell className="font-medium">{method.name}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={isConnected ? "connected" : "disconnected"}
                    statusConfig={STATUS_CONFIG}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {method.minLimit}-{method.maxLimit}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  )
}
export default ProviderDetailsSheet
