import { z } from "zod";

const ProviderBasicInfo = z.object({
  name: z.string().min(1, { message: "Provider name is required" }).max(100),
  description: z.string().max(255).optional(),
});

const ProviderCountryConfig = z.object({
  countryId: z.string().uuid({ message: "Invalid country ID" }),
  config: z
    .object({
      currency: z.string().optional(),
      minLimit: z.number().nonnegative().optional(),
      maxLimit: z.number().nonnegative().optional(),
      extra: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
});

const ProviderPaymentMethod = z.object({
  countryId: z.string().uuid({ message: "Invalid country ID" }),
  name: z.string().min(1, { message: "Payment method name is required" }).max(100),
  code: z.string().min(1, { message: "Payment method code is required" }).max(50),
  capabilities: z
    .object({
      refund: z.boolean().optional(),
      capture: z.boolean().optional(),
      recurring: z.boolean().optional(),
    })
    .optional(),
  minLimit: z.number().nonnegative().optional(),
  maxLimit: z.number().nonnegative().optional(),
  config: z.record(z.string(), z.any()).optional(), // ✅ fixed
});

export const CreateProviderForm = z.object({
  basicInfo: ProviderBasicInfo,
  countries: z
    .array(ProviderCountryConfig)
    .min(1, { message: "Select at least one country" }),
  paymentMethods: z
    .array(ProviderPaymentMethod)
    .min(1, { message: "Add at least one payment method" }),
});

export type CreateProviderFormType = z.infer<typeof CreateProviderForm>;
