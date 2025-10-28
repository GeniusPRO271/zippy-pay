import { luhnCheck } from "@/lib/utils";
import { documentIDCountries } from "./documentID";
import z from "zod";

export const PaymentMethodEnum = z.enum(["bankCard", "bankTransfer", "cash"], "You must select a payment method");
export const PaymentFormSchema = z.object({

  paymentMethod: PaymentMethodEnum,

  cardHoldersName: z
    .string()
    .min(2, "First name must have at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "First name contains invalid characters"),


  email: z.email(),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),

  cardNumber: z
    .string("You must add a Card number")
    .trim()
    .regex(/^[0-9\s]{13,23}$/, "Card number must be between 13 and 19 digits")
    .refine((val) => luhnCheck(val), "Invalid card number"),

  expiryDate: z
    .date("Expiry date must be a valid Date object").refine(
      (expiryDate) => {
        const now = new Date();

        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0 = January, 11 = December

        const expiryYear = expiryDate.getFullYear();
        const expiryMonth = expiryDate.getMonth();

        if (expiryYear > currentYear) return true;
        if (expiryYear === currentYear && expiryMonth >= currentMonth) return true;

        return false;
      },
      {
        message: "Card has expired",
      }
    ),

  cvv: z
    .string()
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),

  country: z
    .string("You must select a country"),

  documentId: z
    .string()
    .trim()
    .optional(),
}).superRefine((data, ctx) => {
  console.log("[DEBUG]: superRefine called with data:", {
    country: data.country,
    documentId: data.documentId,
    documentIdLength: data.documentId?.length || 0,
    documentIdType: typeof data.documentId
  });

  const countryConfig = documentIDCountries.find((c) => c.id === data.country);
  console.log("[DEBUG]: Country config found:", countryConfig ? {
    id: countryConfig.id,
    placeholder: countryConfig.placeholder,
    maxLength: countryConfig.maxLength,
    regex: countryConfig.regex.toString(),
    errorMessage: countryConfig.errorMessage,
    hasValidateFunction: !!countryConfig.validate
  } : null);

  if (!countryConfig) {
    console.log("[DEBUG]: No country config found, skipping validation");
    return; // no validation for unsupported countries
  }

  // Only validate if documentId is present and not empty
  if (data.documentId && data.documentId.length > 0) {
    console.log("[DEBUG]: DocumentId is present, starting validation");
    console.log("[DEBUG]: DocumentId value:", `"${data.documentId}"`);
    console.log("[DEBUG]: Testing against regex:", countryConfig.regex.toString());

    // Test against the regex pattern
    const regexTest = countryConfig.regex.test(data.documentId);
    console.log("[DEBUG]: Regex test result:", regexTest);

    if (!regexTest) {
      console.log("[DEBUG]: Regex test failed, adding issue with message:", countryConfig.errorMessage);
      ctx.addIssue({
        code: "custom",
        path: ["documentId"],
        message: countryConfig.errorMessage,
      });
      return; // Don't run additional validation if format is wrong
    }

    console.log("[DEBUG]: Regex test passed, checking for custom validation function");

    // Run custom validation if provided
    if (countryConfig.validate) {
      console.log("[DEBUG]: Custom validation function exists, calling it");
      const customValidationResult = countryConfig.validate(data.documentId);
      console.log("[DEBUG]: Custom validation result:", customValidationResult);

      if (!customValidationResult) {
        const errorMessage = `Invalid ${countryConfig.id === 'CL' ? 'RUT' : 'document ID'}`;
        console.log("[DEBUG]: Custom validation failed, adding issue with message:", errorMessage);
        ctx.addIssue({
          code: "custom",
          path: ["documentId"],
          message: errorMessage,
        });
      } else {
        console.log("[DEBUG]: Custom validation passed");
      }
    } else {
      console.log("[DEBUG]: No custom validation function provided");
    }
  } else {
    console.log("[DEBUG]: DocumentId is empty or not provided, skipping validation");
    console.log("[DEBUG]: DocumentId value:", data.documentId);
    console.log("[DEBUG]: DocumentId length:", data.documentId?.length || 0);
  }

  console.log("[DEBUG]: superRefine validation complete");
  console.log("[DEBUG]: ----------------------------------------");
});

export type PaymentFormSchemaType = z.infer<typeof PaymentFormSchema>;
