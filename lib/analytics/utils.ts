import { CountryProviderMethod, CountryProviders } from "../types/providers/getProvidersByCountry";
import { BaseTransaction, ChartDataItem, ChartDataWeekly, CountryTransactionSummary, DailyTransactionSummary, FirestoreTimestamp, MonthlyRevenue, RevenueCountry } from "../types/transaction";

/**
 * A helper function to convert a FirestoreTimestamp to a JavaScript Date object.
 * @param timestamp The Firestore timestamp to convert.
 * @returns A JavaScript Date object.
 */
export const timestampToDate = (timestamp: FirestoreTimestamp): Date => {
  return new Date(timestamp._seconds * 1000);
};

/**
 * Generates a Google Cloud Console logs link for a specific transaction ID.
 * The project ID is always set to 'stratech-pay'.
 *
 * @param trxid The transaction ID to search for.
 * @param duration The time range for the log search (e.g., "P7D" for 7 days, "PT1H" for 1 hour). Defaults to "P30D" (30 days).
 * @param authuser The authenticated user account index. Defaults to 1.
 * @returns A formatted URL string for the Google Cloud Console logs.
 */
export function generateGcpLogLink(
  trxid: string,
  duration: string = "P30D",
  authuser: number = 1
): string {

  const projectId = "stratech-pay";

  // CORRECTED: Reverted to a simple and robust string search.
  const query = `${trxid}`;

  // URL encode the query to handle special characters safely.
  const encodedQuery = encodeURIComponent(query);

  // Construct the final URL using a template literal for readability.
  const baseUrl = "https://console.cloud.google.com/logs/query";
  const queryParams = `query=${encodedQuery};duration=${duration}`;
  const urlSuffix = `authuser=${authuser}&project=${projectId}`;

  return `${baseUrl};${queryParams}?${urlSuffix}`;
}


/**
 * A helper function to format a Date object into a 'YYYY-MM-DD' string.
 * @param date The Date object to format.
 * @returns A formatted string e.g., "2025-08-27".
 */
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
}

export type ChartConfigEntry = {
  label: string;
  color: string;
};

/**
 * Defines the type for the overall chart configuration object.
 */
export type ChartConfig = {
  [key: string]: ChartConfigEntry;
};
// =================================================================
// Analysis Functions
// =================================================================

/**
 * Calculates the Average Order Value (AOV) for successful transactions within a given date range.
 * @param transactions An array of transaction objects.
 * @param startDate The start of the date range.
 * @param endDate The end of the date range.
 * @returns The average order value as a number. Returns 0 if no successful transactions are found.
 */
export function calculateAOV(transactions: BaseTransaction[], startDate: Date, endDate: Date): number {
  const successfulTransactions = transactions.filter(tx => {
    const txDate = timestampToDate(tx.dateRequest);
    return tx.status === 'ok' && txDate >= startDate && txDate <= endDate;
  });

  if (successfulTransactions.length === 0) {
    return 0;
  }

  const totalValue = successfulTransactions.reduce((sum, tx) => {
    return sum + parseFloat(tx.quantity);
  }, 0);

  return totalValue / successfulTransactions.length;
}

/**
 * Calculates the success rate of transactions within a given date range.
 * @param transactions An array of transaction objects.
 * @param startDate The start of the date range.
 * @param endDate The end of the date range.
 * @returns The success rate as a percentage (0-100). Returns 0 if no transactions are found.
 */
export function calculateSuccessRate(transactions: BaseTransaction[], startDate: Date, endDate: Date): number {
  const transactionsInRange = transactions.filter(tx => {
    const txDate = timestampToDate(tx.dateRequest);
    return txDate >= startDate && txDate <= endDate;
  });

  if (transactionsInRange.length === 0) {
    return 0;
  }

  const successfulTransactions = transactionsInRange.filter(tx => tx.status === 'ok');

  return (successfulTransactions.length / transactionsInRange.length) * 100;
}

/**
 * Filters and returns all transactions that occurred within a given date range.
 * @param transactions An array of transaction objects.
 * @param startDate The start of the date range.
 * @param endDate The end of the date range.
 * @returns An array of transactions within the specified range.
 */
export function getNewTransactions(transactions: BaseTransaction[], startDate: Date, endDate: Date): BaseTransaction[] {
  return transactions.filter(tx => {
    const txDate = timestampToDate(tx.dateRequest);
    return txDate >= startDate && txDate <= endDate;
  });
}

/**
 * Counts the total number of transactions within a given date range.
 * @param transactions An array of transaction objects.
 * @param startDate The start of the date range.
 * @param endDate The end of the date range.
 * @returns The total number of transactions in the range.
 */
export function getTotalTransactions(transactions: BaseTransaction[], startDate: Date, endDate: Date): number {
  return transactions.filter(tx => {
    const txDate = timestampToDate(tx.dateRequest);
    return txDate >= startDate && txDate <= endDate;
  }).length;
}


/**
 * Aggregates transactions by day, counting the number of successful, pending, and failed transactions.
 * @param transactions An array of transaction objects.
 * @param startDate The start of the date range.
 * @param endDate The end of the date range.
 * @returns An array of objects, each summarizing the transactions for a specific day.
 */
export function aggregateTransactionsByDay(
  transactions: BaseTransaction[],
  startDate: Date,
  endDate: Date
): DailyTransactionSummary[] {
  const dailyStats: { [key: string]: { success: number; pending: number; fail: number } } = {};

  const transactionsInRange = transactions.filter(tx => {
    const txDate = timestampToDate(tx.dateRequest);
    return txDate >= startDate && txDate <= endDate;
  });

  for (const tx of transactionsInRange) {
    const dateKey = formatDate(timestampToDate(tx.dateRequest));

    if (!dailyStats[dateKey]) {
      dailyStats[dateKey] = { success: 0, pending: 0, fail: 0 };
    }

    switch (tx.status) {
      case 'ok':
        dailyStats[dateKey].success++;
        break;
      case 'pending':
        dailyStats[dateKey].pending++;
        break;
      case 'error':
        dailyStats[dateKey].fail++;
        break;
    }
  }

  // Convert object to array and sort by date ascending
  return Object.entries(dailyStats)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}


/**
 * Groups transactions by country and counts the total for each within a date range.
 * @param transactions An array of transaction objects.
 * @param startDate The start of the date range.
 * @param endDate The end of the date range.
 * @returns An array of objects, each summarizing the transaction count for a country.
 */
export function groupTransactionsByCountry(transactions: BaseTransaction[], startDate: Date, endDate: Date): CountryTransactionSummary[] {
  const countryStats: { [key: string]: number } = {};

  const transactionsInRange = getNewTransactions(transactions, startDate, endDate);

  for (const tx of transactionsInRange) {
    const countryKey = tx.country;
    countryStats[countryKey] = (countryStats[countryKey] || 0) + 1;
  }

  return Object.keys(countryStats).map(country => ({
    country: country,
    transactions: countryStats[country],
    fill: "#2B9D90",
  }));
}
/**
 * Generates a configuration object for a chart based on the unique countries in the dataset.
 * This format is compatible with various charting libraries.
 * @param transactions An array of transaction objects.
 * @returns A chart configuration object that satisfies the ChartConfig type.
 */
export function generateChartConfig(transactions: BaseTransaction[]): ChartConfig {
  const uniqueCountries = [...new Set(transactions.map(tx => tx.country))];

  // The 'reduce' method creates the final object from the array of unique countries.
  const config = uniqueCountries.reduce((acc, country, index) => {
    acc[country] = {
      label: country, // For a full name like "Brazil", you would use a lookup map here.
      color: `var(--chart-${index + 1})`,
    };
    return acc;
  }, {} as ChartConfig);

  return config;
}

/**
 * Calculates the total revenue from successful transactions within a given date range.
 * @param transactions An array of transaction objects.
 * @param startDate The start of the date range.
 * @param endDate The end of the date range.
 * @returns The total revenue as a number.
 */
export function calculateTotalRevenue(transactions: BaseTransaction[], startDate: Date, endDate: Date): number {
  const successfulTransactions = transactions.filter(tx => {
    const txDate = timestampToDate(tx.dateRequest);
    return tx.status === 'ok' && txDate >= startDate && txDate <= endDate;
  });

  const totalValue = successfulTransactions.reduce((sum, tx) => {
    // Safely parse the quantity string to a float for calculation
    return sum + parseFloat(tx.quantity);
  }, 0);

  return totalValue;
}

/**
 * Aggregates revenue from successful transactions by month within a specified date range.
 * @param transactions An array of transaction objects.
 * @param startDate The start of the date range.
 * @param endDate The end of the date range.
 * @returns An array of objects, each containing a month and the total revenue for that month.
 */
export function aggregateRevenueByMonth(transactions: BaseTransaction[], startDate: Date, endDate: Date): MonthlyRevenue[] {
  const monthlyRevenue: { [key: number]: number } = {};
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const successfulTransactions = transactions.filter(tx => {
    const txDate = timestampToDate(tx.dateRequest);
    return tx.status === 'ok' && txDate >= startDate && txDate <= endDate;
  });

  for (const tx of successfulTransactions) {
    const month = timestampToDate(tx.dateRequest).getMonth(); // 0 for January, 11 for December
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(tx.quantity);
  }

  // Convert the aggregated object into the desired array format
  return Object.keys(monthlyRevenue).map(monthKey => {
    const monthIndex = parseInt(monthKey, 10);
    return {
      month: monthNames[monthIndex],
      revenue: monthlyRevenue[monthIndex],
    };
  });
}

/**
 * Calculates the percentage change in revenue between the current period and the previous one.
 * @param transactions An array of all transaction objects.
 * @param startDate The start of the current date range.
 * @param endDate The end of the current date range.
 * @returns The percentage change in revenue. Returns Infinity for a new period with revenue.
 */
export function calculateRevenueChangeValue(
  transactions: BaseTransaction[],
  startDate: Date,
  endDate: Date
): number {
  console.debug("[RevenueChangeValue] Start Date:", startDate)
  console.debug("[RevenueChangeValue] End Date:", endDate)

  // 1️⃣ Aggregate monthly revenues in the date range
  const monthlyData = aggregateRevenueByMonth(transactions, startDate, endDate)
  console.debug("[RevenueChangeValue] Monthly Data:", monthlyData)

  if (monthlyData.length === 0) {
    return 0
  }

  // 2️⃣ Sort by chronological order (oldest → newest)
  const sorted = [...monthlyData].sort(
    (a, b) =>
      new Date(`${a.month} 1, 2024`).getTime() -
      new Date(`${b.month} 1, 2024`).getTime()
  )

  // 3️⃣ Get the latest and the previous month
  const last = sorted[sorted.length - 1]
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null

  const currentRevenue = last.revenue
  const previousRevenue = previous ? previous.revenue : 0
  const change = currentRevenue - previousRevenue

  console.debug("[RevenueChangeValue] Current:", currentRevenue)
  console.debug("[RevenueChangeValue] Previous:", previousRevenue)
  console.debug("[RevenueChangeValue] Change:", change)

  return change
}

/**
 * Get the earliest and latest transaction dates from history
 */
export function getTransactionDateRange(
  transactions: BaseTransaction[]
): { from: Date | null; to: Date | null } {
  if (transactions.length === 0) {
    return { from: null, to: null }; // no data available
  }

  let minDate = timestampToDate(transactions[0].dateRequest);
  let maxDate = minDate;

  for (const tx of transactions) {
    const txDate = timestampToDate(tx.dateRequest);

    if (txDate < minDate) {
      minDate = txDate;
    }
    if (txDate > maxDate) {
      maxDate = txDate;
    }
  }

  return { from: minDate, to: maxDate };
}

export function getLast5WeeksChartData(
  transactions: BaseTransaction[],
  endDate: Date
): ChartDataWeekly[] {
  const MS_IN_DAY = 1000 * 60 * 60 * 24;
  const MS_IN_WEEK = 7 * MS_IN_DAY;

  const chartData: ChartDataWeekly[] = [];

  for (let i = 4; i >= 0; i--) {
    const weekEnd = new Date(endDate.getTime() - i * MS_IN_WEEK);
    const weekStart = new Date(weekEnd.getTime() - MS_IN_WEEK + MS_IN_DAY);

    const count = transactions.filter(tx => {
      const txDate = timestampToDate(tx.dateRequest);
      return txDate >= weekStart && txDate <= weekEnd;
    }).length;

    chartData.push({
      week: `Week ${5 - i}`, // Week 1 = oldest, Week 5 = current week
      amount: count,
    });
  }

  return chartData;
}


export function getLast5WeeksAOVChartData(
  transactions: BaseTransaction[],
  endDate: Date
): ChartDataWeekly[] {
  const MS_IN_DAY = 1000 * 60 * 60 * 24;
  const MS_IN_WEEK = 7 * MS_IN_DAY;

  const chartData: ChartDataWeekly[] = [];

  for (let i = 4; i >= 0; i--) {
    const weekEnd = new Date(endDate.getTime() - i * MS_IN_WEEK);
    const weekStart = new Date(weekEnd.getTime() - MS_IN_WEEK + MS_IN_DAY);

    const avgValue = calculateAOV(transactions, weekStart, weekEnd);

    chartData.push({
      week: `Week ${5 - i}`, // Week 1 = oldest, Week 5 = current week
      amount: avgValue,
    });
  }

  return chartData;
}


export type WeekValueType = 'count' | 'aov' | 'successRate';

export interface LastWeekIncreaseResult {
  current: number;
  previous: number;
  percentage: number;
  successRateCurrent: number;   // Always include these for reference
  successRatePrevious: number;
}

export function calculateLastWeekIncrease(
  transactions: BaseTransaction[],
  endDate: Date,
  type: WeekValueType = 'count'
): LastWeekIncreaseResult {
  const MS_IN_DAY = 1000 * 60 * 60 * 24;
  const MS_IN_WEEK = 7 * MS_IN_DAY;

  const currentEnd = endDate;
  const currentStart = new Date(currentEnd.getTime() - MS_IN_WEEK + MS_IN_DAY);

  const previousEnd = new Date(currentStart.getTime() - MS_IN_DAY);
  const previousStart = new Date(previousEnd.getTime() - MS_IN_WEEK + MS_IN_DAY);

  const calculateSuccessRate = (txs: BaseTransaction[]) => {
    const successCount = txs.filter(tx => tx.status === 'ok').length;
    return txs.length === 0 ? 0 : (successCount / txs.length) * 100;
  };

  const currentTx = transactions.filter(tx => {
    const txDate = timestampToDate(tx.dateRequest);
    return txDate >= currentStart && txDate <= currentEnd;
  });
  const previousTx = transactions.filter(tx => {
    const txDate = timestampToDate(tx.dateRequest);
    return txDate >= previousStart && txDate <= previousEnd;
  });

  let current: number, previous: number;

  if (type === 'count') {
    current = currentTx.length;
    previous = previousTx.length;
  } else if (type === 'aov') {
    const calculateAOV = (txs: BaseTransaction[]) => {
      if (txs.length === 0) return 0;
      return txs.reduce((sum, tx) => sum + Number(tx.quantity), 0) / txs.length;
    };
    current = calculateAOV(currentTx);
    previous = calculateAOV(previousTx);
  } else {
    // successRate as main value
    current = calculateSuccessRate(currentTx);
    previous = calculateSuccessRate(previousTx);
  }

  const percentage = previous === 0 ? (current === 0 ? 0 : Infinity) : ((current - previous) / previous) * 100;

  // always include success rates for reference
  const successRateCurrent = calculateSuccessRate(currentTx);
  const successRatePrevious = calculateSuccessRate(previousTx);

  return { current, previous, percentage, successRateCurrent, successRatePrevious };
}


export function getLast5WeeksSuccessRateChartData(
  transactions: BaseTransaction[],
  endDate: Date
): ChartDataWeekly[] {
  const MS_IN_DAY = 1000 * 60 * 60 * 24;
  const MS_IN_WEEK = 7 * MS_IN_DAY;

  const chartData: ChartDataWeekly[] = [];

  const calculateSuccessRate = (txs: BaseTransaction[]) => {
    if (txs.length === 0) return 0;
    const successCount = txs.filter(tx => tx.status === 'ok').length;
    return (successCount / txs.length) * 100;
  };

  for (let i = 4; i >= 0; i--) {
    const weekEnd = new Date(endDate.getTime() - i * MS_IN_WEEK);
    const weekStart = new Date(weekEnd.getTime() - MS_IN_WEEK + MS_IN_DAY);

    const weeklyTransactions = transactions.filter(tx => {
      const txDate = timestampToDate(tx.dateRequest);
      return txDate >= weekStart && txDate <= weekEnd;
    });

    const successRate = calculateSuccessRate(weeklyTransactions);

    chartData.push({
      week: `Week ${5 - i}`, // Week 1 = oldest, Week 5 = current week
      amount: successRate,   // using 'amount' field to store the percentage
    });

    console.log(`[DEBUG] Week ${5 - i}: ${weekStart.toDateString()} - ${weekEnd.toDateString()}, Success Rate: ${successRate}%`);
  }

  return chartData;
}



// Dynamic interface for chart data - each country becomes a property
export interface RevenueChartData {
  date: string;
  total: number;
  [countryCode: string]: string | number; // Dynamic country properties
}

const colorPalette = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
]
/**
 * Generates chart data and config for revenue per country over time
 */
export function generateRevenueChartData(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): { data: RevenueChartData[]; config: ChartConfig } {

  // Filter transactions in date range with status 'ok'
  const filteredTransactions = transactions.filter(t => {
    if (t.status !== 'ok') return false;
    const date = timestampToDate(t.dateRequest);
    return date >= from && date <= to;
  });

  // Extract unique countries
  const countries = Array.from(
    new Set(filteredTransactions.map(t => t.country))
  ).sort();

  // Group transactions by date
  const dateMap = new Map<string, Map<string, number>>();

  for (const t of filteredTransactions) {
    const date = timestampToDate(t.dateRequest);
    const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const qty = parseFloat(t.quantity);

    if (isNaN(qty)) continue;

    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, new Map());
    }

    const countryMap = dateMap.get(dateStr)!;
    countryMap.set(t.country, (countryMap.get(t.country) || 0) + qty);
  }

  // Generate chart data
  const data: RevenueChartData[] = [];
  const sortedDates = Array.from(dateMap.keys()).sort();

  for (const dateStr of sortedDates) {
    const countryMap = dateMap.get(dateStr)!;
    const entry: RevenueChartData = {
      date: dateStr,
      total: 0,
    };

    // Add revenue for each country
    for (const country of countries) {
      const revenue = countryMap.get(country) || 0;
      entry[country] = parseFloat(revenue.toFixed(2));
      entry.total += revenue;
    }

    entry.total = parseFloat(entry.total.toFixed(2));
    data.push(entry);
  }

  // Generate chart config
  const config: ChartConfig = {
    total: {
      label: "Total Revenue",
      color: "hsl(var(--chart-3))",
    },
  };

  // Add config for each country with different colors
  countries.forEach((country, index) => {
    config[country] = {
      label: country,
      color: colorPalette[index % colorPalette.length], // Cycle through colors
    }
  })

  return { data, config };
}


/**
 * Static currency conversion rates relative to USD.
 * Example: 1 EUR = 1.1 USD, 1 CLP = 0.0011 USD, etc.
 * You can later replace this with a dynamic API (e.g., exchangeratesapi.io).
 */
const USD_PER_UNIT: Record<string, number> = {
  USD: 1,
  BRL: 0.19,   // Brazil
  MXN: 0.056,  // Mexico
  CLP: 0.0011, // Chile
  COP: 0.00026, // Colombia
  GTQ: 0.13,   // Guatemala
};

/**
 * Convert an amount between currencies using a table of USD-per-unit rates.
 * - If either currency is missing, returns the original amount.
 * - Rounds only at the call site (keep this pure).
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  usdPerUnit: Record<string, number> = USD_PER_UNIT
): number {
  if (!isFinite(amount)) return 0

  const fromCode = from.toUpperCase()
  const toCode = to.toUpperCase()

  const usdPerFrom = usdPerUnit[fromCode]
  const usdPerTo = usdPerUnit[toCode]

  if (!usdPerFrom || !usdPerTo) {
    console.warn(`Unsupported currency conversion: ${fromCode} → ${toCode}`)
    return amount
  }

  // 1) from → USD (multiply because table is USD per unit)
  const amountInUSD = amount * usdPerFrom
  // 2) USD → to (divide by USD per target unit)
  const amountInTarget = amountInUSD / usdPerTo

  return amountInTarget
}

/**
 * Convert all transaction quantities to the target currency.
 * Returns a *new* array; does not mutate input.
 */
export function convertTransactionsToCurrency(
  transactions: BaseTransaction[],
  targetCurrency: string,
  options?: {
    decimals?: number // default 2
    usdPerUnit?: Record<string, number>
  }
): BaseTransaction[] {
  const decimals = options?.decimals ?? 2
  const table = options?.usdPerUnit ?? USD_PER_UNIT
  const target = targetCurrency.toUpperCase()

  return transactions.map((tx) => {
    const amount = parseFloat(tx.quantity)
    const converted =
      isNaN(amount) ? 0 : convertCurrency(amount, tx.currency, target, table)

    return {
      ...tx,
      quantity: converted.toFixed(decimals),
      currency: target,
    }
  })
}


/**
 * Calculates total revenue per country for the period [from, to]
 * and compares the last 7 days vs the previous 7 days.
 * 
 * Steps:
 * 1. Filter transactions between from and to
 * 2. Calculate total revenue from filtered transactions
 * 3. Compare last 7 days (to - 7 days to to) vs previous 7 days ((to - 7 days) - 7 days to to - 7 days)
 */
export function calculateRevenueByCountry(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): RevenueCountry[] {
  const msPerDay = 24 * 60 * 60 * 1000;


  // Step 1: Filter transactions between from and to where status is 'ok'
  const filteredTransactions = transactions.filter(t => {
    if (t.status !== 'ok') return false;
    const date = timestampToDate(t.dateRequest);
    return date >= from && date <= to;
  });

  console.log(`📊 Total filtered transactions: ${filteredTransactions.length}`);

  // Step 2: Define the two 7-day periods for comparison
  // Last 7 days: (to - 7 days) to to
  const lastWeekStart = new Date(to.getTime() - 7 * msPerDay);
  const lastWeekEnd = to;

  // Previous 7 days: (to - 14 days) to (to - 7 days)
  const previousWeekStart = new Date(to.getTime() - 14 * msPerDay);
  const previousWeekEnd = new Date(to.getTime() - 7 * msPerDay);

  console.log('📅 Last 7 days:', lastWeekStart.toISOString(), 'to', lastWeekEnd.toISOString());
  console.log('📅 Previous 7 days:', previousWeekStart.toISOString(), 'to', previousWeekEnd.toISOString());

  // Step 3: Calculate totals per country
  const countryData = new Map<string, {
    totalRevenue: number;
    lastWeekRevenue: number;
    previousWeekRevenue: number;
  }>();

  for (const t of filteredTransactions) {
    const date = timestampToDate(t.dateRequest);
    const qty = parseFloat(t.quantity);

    if (isNaN(qty)) continue;

    if (!countryData.has(t.country)) {
      countryData.set(t.country, {
        totalRevenue: 0,
        lastWeekRevenue: 0,
        previousWeekRevenue: 0
      });
    }

    const data = countryData.get(t.country)!;

    // Add to total revenue
    data.totalRevenue += qty;

    // Check if transaction is in last 7 days
    if (date >= lastWeekStart && date <= lastWeekEnd) {
      data.lastWeekRevenue += qty;
    }

    // Check if transaction is in previous 7 days
    if (date >= previousWeekStart && date < previousWeekEnd) {
      data.previousWeekRevenue += qty;
    }
  }

  console.log('📊 Country data:', Array.from(countryData.entries()));

  // Step 4: Calculate percentage increase
  const result: RevenueCountry[] = [];

  for (const [country, data] of countryData) {
    let increase: number;

    if (data.previousWeekRevenue === 0) {
      // No previous week data
      increase = data.lastWeekRevenue > 0 ? 100 : 0;
    } else {
      // Calculate percentage change (can be negative)
      increase = ((data.lastWeekRevenue - data.previousWeekRevenue) / data.previousWeekRevenue) * 100;
    }

    result.push({
      country,
      totalRevenue: parseFloat(data.totalRevenue.toFixed(2)),
      lastWeekIncrease: parseFloat(increase.toFixed(2))
    });
  }

  return result;
}

/**
 * Process transactions and count statuses within a date range
 * @param transactions - Array of transactions to process
 * @param from - Start date
 * @param to - End date
 * @returns Array of chart data with status counts
 */
export function processTransactionData(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): ChartDataItem[] {
  const fromTimestamp = from.getTime();
  const toTimestamp = to.getTime();

  // Filter transactions within the date range using dateRequest
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = timestampToDate(transaction.dateRequest);
    const timestamp = transactionDate.getTime();
    return timestamp >= fromTimestamp && timestamp <= toTimestamp;
  });

  // Count statuses
  const statusCounts = {
    success: 0,
    pending: 0,
    fail: 0,
  };

  filteredTransactions.forEach((transaction) => {
    if (transaction.status === 'ok') {
      statusCounts.success++;
    } else if (transaction.status === 'pending') {
      statusCounts.pending++;
    } else if (transaction.status === 'error') {
      statusCounts.fail++;
    }
  });

  // Return chart data format
  return [
    { status: "success", count: statusCounts.success, fill: "var(--color-success)" },
    { status: "pending", count: statusCounts.pending, fill: "var(--color-pending)" },
    { status: "fail", count: statusCounts.fail, fill: "var(--color-fail)" },
  ];
}

/**
 * Filter transactions within a date range
 * @param transactions - Array of transactions to filter
 * @param from - Start date
 * @param to - End date
 * @returns Filtered array of transactions within the date range
 */
export function filterTransactionsByDateRange(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): BaseTransaction[] {

  console.log("DATE RANGE FROM: ", from)
  console.log("DATE RANGE TO: ", to)

  const fromTimestamp = from.getTime();
  const toTimestamp = to.getTime();

  console.log("DATE RANGE FROM: ", fromTimestamp)
  console.log("DATE RANGE TO: ", toTimestamp)

  const transactionsFiltered = transactions.filter((transaction) => {
    const transactionDate = timestampToDate(transaction.dateRequest);
    const timestamp = transactionDate.getTime();
    return timestamp >= fromTimestamp && timestamp <= toTimestamp;
  });

  console.log("DATE RANGE FILTER TRANSACTIONS: ", transactionsFiltered)
  return transactionsFiltered
}

/**
 * Capitalizes the first letter of a string.
 * @example
 * capitalizeFirstLetter("banco estado") → "Banco estado"
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Extracts CountryProviders[] from a list of BaseTransaction
 * filtering only those inside the [from, to] date range.
 */
export function extractCountryProviders(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): CountryProviders[] {
  const fromMs = from.getTime()
  const toMs = to.getTime()

  const countries = new Map<string, CountryProviders>()

  for (const tx of transactions) {
    const txDate = timestampToDate(tx.dateRequest)
    const txMs = txDate.getTime()

    // Filter transactions outside the range
    if (txMs < fromMs || txMs > toMs) continue

    // `country` is already the ISO code (e.g. "CL", "US", "BR")
    const isoCode = tx.country.toUpperCase()

    // Create country if not exists
    if (!countries.has(isoCode)) {
      countries.set(isoCode, {
        id: isoCode.toLowerCase(),
        name: isoCode,
        isoCode,
        currencyCode: tx.currency || null,
        providers: [],
      })
    }

    const country = countries.get(isoCode)!

    // Create or find provider
    const providerId = tx.provider.toLowerCase()
    let provider = country.providers.find((p) => p.id === providerId)
    if (!provider) {
      provider = {
        id: providerId,
        name: capitalizeFirstLetter(tx.provider),
        description: null,
        methods: [],
      }
      country.providers.push(provider)
    }

    // Create or find method
    const methodId = tx.payMethod.toLowerCase()
    if (!provider.methods.some((m) => m.id === methodId)) {
      const method: CountryProviderMethod = {
        id: methodId,
        name: capitalizeFirstLetter(tx.payMethod),
        code: methodId,
        minLimit: null,
        maxLimit: null,
      }
      provider.methods.push(method)
    }
  }

  return Array.from(countries.values())
}
