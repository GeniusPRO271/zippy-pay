import { z } from "zod";
import { validateExcelFormula } from "@/lib/excelFormula";

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
                /^=?(?:\s|[0-9]+(?:,[0-9]+)?%?|amount|IF|MIN|MAX|ABS|ROUND|SUM|[()+\-*/;.,]|<=|>=|==|!=|<|>|%)+$/i,
                "Formula contains invalid characters"
              )
              .refine(
                (formula) => validateExcelFormula(formula).valid,
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
