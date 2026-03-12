import { z } from "zod";
import { ReportFinancePathSchema } from "./reportFinancePath";
import { ReportResumePathSchema } from "./reportResumeForm";

export const FirestoreTimestampSchema = z.object({
  _seconds: z.coerce.number(),
  _nanoseconds: z.coerce.number(),
});

export const ReportTransactionSchema = z.object({
  id: z.string(),
  merchantName: z.string(),
  provider: z.string(),
  documentId: z.union([z.string(), z.number()]),
  quantity: z.string(),
  commerceId: z.string(),
  commerceReqId: z.string(),
  email: z.string(),
  name: z.string(),
  request_timestamp: z.coerce.number(),
  country: z.string(),
  currency: z.string(),
  payMethod: z.string(),
  payinExpirationTime: z.string(),
  zippy_test: z.boolean(),
  url_OK: z.string(),
  url_ERROR: z.string(),
  dateRequest: z.string(),
  code: z.number(),
  status: z.enum(["pending", "ok", "error"]),
});


export const CreateReportSchema = z.discriminatedUnion("reportType", [
  z.object({
    reportType: z.literal("finance"),
    parameters: ReportFinancePathSchema,
    transactions: z.array(ReportTransactionSchema)
  }),
  z.object({
    reportType: z.literal("daily"),
  }),
  z.object({
    reportType: z.literal("resume"),
    parameters: ReportResumePathSchema,
    transactions: z.array(ReportTransactionSchema)
  }),
]);

export type CreateReportSchemaType = z.infer<typeof CreateReportSchema>;
