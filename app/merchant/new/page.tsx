import { getAllCountries, getCountriesWithProviders } from "@/actions/countryActions"
import CreateMerchantComponentForm from "@/components/merchants/merchant-create/form"

async function CreateMerchantPage() {
  const { data: countries } = await getCountriesWithProviders()

  console.log("[DEBUG] Countries List: ", countries)
  return (
    <div className="p-5 w-full h-full flex flex-col">
      <div className="items-center justify-between flex mb-2">
        <h1 className="scroll-m-20 text-center text-2xl font-bold tracking-tight text-balance">
          Merchants
        </h1>
      </div>
      {countries &&
        <div className="flex w-full gap-2 justify-center items-start ">
          <CreateMerchantComponentForm countriesWithProviders={countries} />
        </div>
      }

    </div>
  )
}

export default CreateMerchantPage
