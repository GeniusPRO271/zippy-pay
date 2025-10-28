import StatusBadge from "@/components/dashboard/table/statusBadge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { STATUS_CONFIG } from "./providerStatusConfig"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { notFound } from "next/navigation"
import { getProviderById } from "@/actions/providerActions"
import { PaymentMethodLimit, ProviderCountryDetail } from "@/lib/types/provider"
import { CountryWithMethods, ProviderInfo } from "@/lib/types/merchant"

async function ProviderDetailsSheet({ children, providerID, providersMerchants }: { children: React.ReactNode, providerID: string, providersMerchants: ProviderInfo }) {
  const provider = await getProviderById(providerID)

  if (!provider) {
    notFound();
  }

  providersMerchants.countries.forEach((country) => {
    console.log(
      `[DEBUG] Method MERCHANT in country: ${country.name} → ${country.paymentMethods
        .map((m) => m.paymentMethodName)
        .join(", ")}`
    );
  });

  provider.countries.forEach((country) => {
    console.log(
      `[DEBUG] Method PROVIDER in country : ${country.countryName} → ${country.paymentMethods
        .map((m) => m.paymentMethodName)
        .join(", ")}`
    );
  });

  provider.countries.forEach((providerCountry) => {
    // Find the matching country in the merchants array
    const merchantCountry = providersMerchants.countries.find((mc) => {
      console.log(
        `[DEBUG] Comparing Provider country ID: ${providerCountry.countryId} with Merchant country ID: ${mc.id}`
      );
      return mc.id === providerCountry.countryId;
    });

    if (!merchantCountry) {
      console.log(
        `[DEBUG] No matching merchant country for: ${providerCountry.countryName} (Provider country ID: ${providerCountry.id})`
      );
      return;
    }

    // Compare methods
    providerCountry.paymentMethods.forEach((providerMethod) => {
      const merchantMethod = merchantCountry.paymentMethods.find(
        (m) => m.paymentMethodName === providerMethod.paymentMethodName
      );

      const existsInMerchant = !!merchantMethod;

      console.log(
        `[DEBUG] Provider method "${providerMethod.paymentMethodName}" `
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
                {provider.name}
              </h4>
              <StatusBadge status="connected" statusConfig={STATUS_CONFIG} />
            </div>
          </SheetTitle>
          <SheetDescription>
            View this providers available methods, and current connection status by country thogheter with thier min-max amount for transactions.
          </SheetDescription>
          <div className="flex mt-5 gap-5 flex-col">
            {provider.countries.map((country) => {
              // Find the matching merchant country
              const merchantCountry = providersMerchants.countries.find(
                (mc) => mc.id === country.countryId
              );

              return (
                <MethodStatusTable
                  key={country.id}
                  merchantCountryMethods={merchantCountry} // pass merchant methods or empty array
                  countryMethods={country}
                />
              );
            })}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}


function MethodStatusTable({ countryMethods, merchantCountryMethods }: { countryMethods: ProviderCountryDetail, merchantCountryMethods: CountryWithMethods | undefined }) {
  return (
    <div>
      <h4 className="scroll-m-20 text-normal font-semibold tracking-tight">
        {countryMethods.countryName}
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
          {countryMethods.paymentMethods.map((method) => {
            const isConnected = merchantCountryMethods?.paymentMethods.some(
              (pm) => pm.paymentMethodName === method.paymentMethodName
            );

            return (
              <TableRow key={method.id}>
                <TableCell className="font-medium">{method.paymentMethodName}</TableCell>
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
