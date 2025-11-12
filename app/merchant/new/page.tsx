import { getAllCountriesWithProviders } from "@/actions/provider/getProvidersByCountryAction"
import CreateMerchantComponentForm from "@/components/merchants/merchant-create/form"
import { CountryProviders } from "@/lib/types/providers/getProvidersByCountry"

async function CreateMerchantPage() {
  const countriesWithProviders = await getAllCountriesWithProviders() as CountryProviders[]

  console.log("[DEBUG] Countries List: ", countriesWithProviders)
  return (
    <div className="p-5 w-full h-full flex flex-col">
      <div className="items-center justify-between flex mb-2">
        <h1 className="scroll-m-20 text-center text-2xl font-bold tracking-tight text-balance">
          Merchants
        </h1>
      </div>
      {countriesWithProviders &&
        <div className="flex w-full gap-2 justify-center items-start ">
          <CreateMerchantComponentForm countriesWithProviders={countriesWithProviders} />
        </div>
      }

    </div>
  )
}

export default CreateMerchantPage
