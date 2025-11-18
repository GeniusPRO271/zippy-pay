import { z } from "zod";

export const ReportFinanceProvidersSchemaStep1 = z
  .array(
    z.object({
      providerId: z.string().min(1, { message: "Provider ID is required" }),
      providerName: z
        .string()
        .min(1, { message: "Provider name is required" })
        .max(255, { message: "Provider name too long" }),
      methods: z
        .array(
          z.object({
            methodId: z.string().min(1, { message: "Method ID is required" }),
            methodName: z.string().min(1, { message: "Method name is required" })
          })
        )
        .min(1, { message: "Select at least one method" }),
    })
  )
  .min(1, { message: "Select at least one provider" });

export const ReportFinanceProvidersSchemaStep2 = z
  .array(
    z.object({
      providerId: z.string().min(1, { message: "Provider ID is required" }),
      providerName: z
        .string()
        .min(1, { message: "Provider name is required" })
        .max(255, { message: "Provider name too long" }),
      methods: z
        .array(
          z.object({
            methodId: z.string().min(1, { message: "Method ID is required" }),
            methodName: z.string().min(1, { message: "Method name is required" }),
            commissionFormula: z
              .string()
              .trim()
              .min(1, { message: "Commission formula is required" })
              .regex(
                /^[0-9+\-*/()?.:><=,\samountMathminax]*$/,
                "Formula contains invalid characters"
              )
              .refine(
                (formula) => {
                  try {
                    const safeFormula = formula
                      .replace(/amount/g, "100")
                      .replace(/Math\.min/g, "Math.min")
                      .replace(/Math\.max/g, "Math.max");
                    const fn = new Function("Math", `return (${safeFormula});`);
                    fn(Math);
                    return true;
                  } catch {
                    return false;
                  }
                },
                "Invalid formula syntax"
              ),
          })
        )
        .min(1, { message: "Select at least one method" }),
    })
  )
  .min(1, { message: "Select at least one provider" });

export const ProvidersSchema = ReportFinanceProvidersSchemaStep2;
export type ProvidersSchemaType = z.infer<typeof ProvidersSchema>;

export const ReportFinanceStep1Schema = z.object({
  merchantName: z.string().min(1, { message: "Merchant name is required" }),
  countryId: z.string().min(1, { message: "Country ID is required" }),
  countryName: z
    .string()
    .min(1, { message: "Country name is required" })
    .max(255, { message: "Country name too long" }),
  providers: ReportFinanceProvidersSchemaStep1,
});

export const ReportFinancePathSchema = z.object({
  merchantName: z.string().min(1, { message: "Merchant name is required" }),
  countryId: z.string().min(1, { message: "Country ID is required" }),
  countryName: z
    .string()
    .min(1, { message: "Country name is required" })
    .max(255, { message: "Country name too long" }),
  providers: ReportFinanceProvidersSchemaStep2,
});

export type ReportFinancePathSchemaType = z.infer<typeof ReportFinancePathSchema>;
