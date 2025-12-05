export interface BaseTransaction {
  id: string;
  merchantName: string
  provider: string
  documentId: string | number;
  quantity: string;
  commerceId: string;
  commerceReqId: string;
  email: string;
  name: string;
  request_timestamp: number;
  country: string;
  currency: string;
  payMethod: string;
  payinExpirationTime: string;
  zippy_test: boolean;
  url_OK: string;
  url_ERROR: string;
  dateRequest: Date;
  code: number;
  status: 'pending' | 'ok' | 'error';
}


export interface DailyTransactionSummary {
  date: string;
  success: number;
  pending: number;
  fail: number;
}

export interface CountryTransactionSummary {
  country: string;
  transactions: number;
  fill: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface ChartDataWeekly {
  week: string;
  amount: number;
}


export interface RevenueEntry {
  date: string
  name: string
  revenue: number
}

export interface RevenueCountry {
  country: string
  totalRevenue: number
  lastWeekIncrease: number
}

export interface ChartDataItem {
  status: string;
  count: number;
  fill: string;
}
