import { z } from "zod";

export const ReportResumeSchema = z.object({
  merchants: z.array(
    z.object({
      merchantName: z.string(),
      countries: z.array(
        z.object({
          countryName: z.string(),
          providers: z.array(
            z.object({
              providerId: z.string(),
              providerName: z.string(),
              methods: z.array(
                z.object({
                  methodId: z.string(),
                  methodName: z.string(),
                  commissionFormula: z.string()
                    .trim()
                    .min(1, { message: "Commission formula is required" })
                    .regex(
                      /^[0-9+\-*/()?.:><=,\samountMathminax]*$/,
                      "Formula contains invalid characters"
                    )
                    .refine((formula) => {
                      try {
                        const safeFormula = formula
                          .replace(/amount/g, "100")
                          .replace(/Math\.min/g, "Math.min")
                          .replace(/Math\.max/g, "Math.max");

                        // Validate by evaluating test-safe version
                        const fn = new Function("Math", `return (${safeFormula});`);
                        fn(Math);
                        return true;
                      } catch {
                        return false;
                      }
                    }, "Invalid formula syntax"),
                })
              ),
            })
          ),
        })
      ),
    })
  )
});

export type ReportResumeType = z.infer<typeof ReportResumeSchema>["merchants"];
