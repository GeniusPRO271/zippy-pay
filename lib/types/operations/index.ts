import z from "zod"

// --- Filter types ---

export const OperationsFilterSchema = z.object({
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

  status: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => (val ? ([] as string[]).concat(val) : [])),

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

  currency: z
    .string()
    .optional(),
}).transform((filters) => ({
  ...filters,
  from: filters.from || undefined,
  to: filters.to || undefined,
}))

export type OperationsFilters = z.infer<typeof OperationsFilterSchema>

// --- Response types ---

export interface MerchantDistribution {
  name: string
  count: number
  fill: string
}

export interface ProviderDistribution {
  name: string
  count: number
  fill: string
}

export interface OperationsStatsResponse {
  transactionCount: number
  localCurrencyAmount: number | null
  averageTicket: number | null
  currency: string | null
  merchantDistribution: MerchantDistribution[]
  providerDistribution: ProviderDistribution[]
}
