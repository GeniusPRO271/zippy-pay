import z from "zod"

// --- Filter types ---

export const TransactionAnalyticsFilterSchema = z.object({
  from: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("")),

  to: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("")),

  methodType: z
    .enum(["payin", "payout"])
    .optional(),

  payMethodId: z
    .union([z.string().uuid(), z.array(z.string().uuid())])
    .optional()
    .transform((val) => (val ? ([] as string[]).concat(val) : [])),

  merchantId: z
    .union([z.string().uuid(), z.array(z.string().uuid())])
    .optional()
    .transform((val) => (val ? ([] as string[]).concat(val) : [])),

  providerId: z
    .union([z.string().uuid(), z.array(z.string().uuid())])
    .optional()
    .transform((val) => (val ? ([] as string[]).concat(val) : [])),

  countryId: z
    .union([z.string().uuid(), z.array(z.string().uuid())])
    .optional()
    .transform((val) => (val ? ([] as string[]).concat(val) : [])),
}).transform((filters) => ({
  ...filters,
  from: filters.from || undefined,
  to: filters.to || undefined,
}))

export type TransactionAnalyticsFilters = z.infer<typeof TransactionAnalyticsFilterSchema>

// --- Response types ---

export interface StatusDistribution {
  approved: number
  pending: number
  failed: number
  total: number
}

export interface MerchantMatrixRow {
  merchantName: string
  approved: number
  pending: number
  failed: number
  total: number
}

export interface ProviderMatrixRow {
  providerName: string
  approved: number
  pending: number
  failed: number
  total: number
}

export interface TransactionAnalyticsResponse {
  statusDistribution: StatusDistribution
  merchantMatrix: MerchantMatrixRow[]
  providerMatrix: ProviderMatrixRow[]
}
