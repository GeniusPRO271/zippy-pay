import { z } from "zod";

export const ProvidersSchema = z
  .array(z.object({
    providerId: z.string().min(1, { message: "Provider ID is required" }),
    providerName: z
      .string()
      .min(1, { message: "Provider name is required" })
      .max(255, { message: "Provider name too long" }),

    methods: z
      .array(
        z.object({
          methodId: z.string().min(1, { message: "Merchant ID is required" }),
          methodName: z
            .string()
            .min(1, { message: "Method name is required" })
            .max(255, { message: "Method name too long" }),
        })
      )
      .min(1, { message: "Select at least one method" }),
  })
  )
  .min(1, { message: "Select at least one provider" });

export type ProvidersSchemaType = z.infer<typeof ProvidersSchema>;

export const Step1Schema = z.object({
  merchantName: z.string().min(1, { message: "Merchant name is required" }),
  countryId: z.string().min(1, { message: "Country ID is required" }),
  countryName: z
    .string()
    .min(1, { message: "Country name is required" })
    .max(255, { message: "Country name too long" }),
  providers: ProvidersSchema,
});


export const Step2Schema = z.object({
  providers: z.array(
    z.object({
      providerId: z.string(),
      methods: z.array(
        z.object({
          methodId: z.string(),
          commissionFormula: z.string().trim()
            .regex(
              // Allow numbers, spaces, parentheses, amount, Math.min/max, arithmetic ops, ?, :, >, <, =, commas, and dots
              /^[0-9+\-*/()?.:><=,\samountMathminax]*$/,
              "Formula contains invalid characters"
            )
            .refine((formula) => {
              try {
                // Replace known safe identifiers
                const safeFormula = formula
                  .replace(/amount/g, "100")
                  .replace(/Math\.min/g, "Math.min")
                  .replace(/Math\.max/g, "Math.max");

                // eslint-disable-next-line no-new-func
                const fn = new Function("Math", `return (${safeFormula});`);
                fn(Math); // Try evaluating
                return true;
              } catch {
                return false;
              }
            }, "Invalid formula syntax")
        })
      ),
    })
  ),
});

export const FinalMerchantCommissionSchema = Step1Schema
  .and(Step2Schema);

export type FinalMerchantCommissionType = z.infer<typeof FinalMerchantCommissionSchema>;
