export interface TransactionFilters {
  methodType?: "payin" | "payout"
  payMethodId?: string[]
  status?: string[]
  merchantId?: string[]
  providerId?: string[]
  countryId?: string[]
  requestDateFrom?: string
  requestDateTo?: string
  transferDateFrom?: string
  transferDateTo?: string
  searchName?: string
  searchEmail?: string
  searchIdDocument?: string
  amountMin?: number
  amountMax?: number
  searchZippyId?: string
  searchMerchantId?: string
}

export type TransactionStatus =
  | "approved"
  | "pending"
  | "failed"
  | "expired"
  | "refunded"

export interface Transaction {
  id: string
  method: string
  status: TransactionStatus
  merchant: string
  provider: string
  country: string
  requestDate: string
  transferDate: string | null
  name: string
  email: string
  idDocument: string
  amount: number
  currency: string
  zippyId: string
  commerceReqId: string
}

export interface TransactionsResponse {
  data: Transaction[]
  total: number
  page: number
  pageSize: number
}
