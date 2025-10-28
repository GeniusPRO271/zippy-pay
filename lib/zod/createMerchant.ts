import { z } from "zod"

const MerchantBasicInfo = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Merchant name is required").max(255),
  email: z.string().email("Invalid email address").max(255),
  businessType: z.string().min(1, "Business type is required").max(100),
})

const MerchantCountrySelection = z.object({
  countryIds: z.array(z.string().uuid("Invalid country ID")).min(1, "Select at least one country"),
})

const MerchantProviderMethod = z.object({
  countryName: z.string(),
  providerId: z.string(),
  paymentMethodIds: z.array(z.string()).min(1, "Select at least one method"),

})

export const CreateMerchantForm = z.object({
  basicInfo: MerchantBasicInfo,
  countries: MerchantCountrySelection,
  providers: z.array(MerchantProviderMethod).min(1, "Select at least one provider"),
})

export type CreateMerchantFormType = z.infer<typeof CreateMerchantForm>
