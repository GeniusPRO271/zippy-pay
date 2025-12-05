/// <reference lib="webworker" />

let W_LENGTH = 0;

let W_TIMESTAMPS = null;
let W_QUANTITIES = null;
let W_STATUSES = null;

let W_COUNTRY_INDEX = null;
let W_METHOD_INDEX = null;
let W_PROVIDER_INDEX = null
let W_MERCHANT_INDEX = null

let W_COUNTRIES = [];
let W_METHODS = [];
let W_PROVIDERS = [];
let W_MERCHANTS = [];

const STATUS_PENDING = 0;
const STATUS_OK = 1;
const STATUS_ERROR = 2;

function formatDateFromMs(ms) {
  return new Date(ms).toISOString().split("T")[0];
}

function buildFilterChecker(filters) {
  const filter = {
    countries: null,
    methods: null,
    providers: null,
  };

  if (Array.isArray(filters)) {
    for (const f of filters) {
      if (!f || !f.id) continue;
      const id = f.id;
      const value = f.value;
      if (value == null || value === "" || (Array.isArray(value) && value.length === 0))
        continue;
      const values = Array.isArray(value) ? value : [value];

      if (id === "country") {
        filter.countries = new Set(values);
      }
      if (id === "payMethod" || id === "paymentMethod" || id === "method") {
        filter.methods = new Set(values);
      }
      if (id === "provider") {
        filter.providers = new Set(values);
      }
    }
  }

  return function matchesFilter(index) {
    if (filter.countries) {
      const ci = W_COUNTRY_INDEX[index];
      const c = W_COUNTRIES[ci];
      if (!filter.countries.has(c)) return false;
    }
    if (filter.methods) {
      const mi = W_METHOD_INDEX[index];
      const m = W_METHODS[mi];
      if (!filter.methods.has(m)) return false;
    }
    if (filter.providers) {
      const pi = W_PROVIDER_INDEX[index];
      const p = W_PROVIDERS[pi];
      if (!filter.providers.has(p)) return false;
    }
    return true;
  };
}

function downsampleSeries(data, maxPoints, xKey, yKeys) {
  if (!Array.isArray(data) || data.length <= maxPoints) return data;

  const length = data.length;
  const bucketSize = length / maxPoints;
  const result = [];

  for (let i = 0; i < maxPoints; i++) {
    const start = Math.floor(i * bucketSize);
    let end = Math.floor((i + 1) * bucketSize);
    if (start >= length) break;
    if (end <= start) end = start + 1;
    if (end > length) end = length;

    const sliceCount = end - start;
    const reprIndex = Math.floor((start + end - 1) / 2);
    const repr = data[reprIndex];

    const aggregated = { [xKey]: repr[xKey] };

    for (const key of yKeys) {
      let sum = 0;
      for (let j = start; j < end; j++) {
        const v = data[j][key] ?? 0;
        sum += v;
      }
      aggregated[key] = sliceCount > 0 ? Number((sum / sliceCount).toFixed(2)) : 0;
    }

    result.push(aggregated);
  }

  return result;
}


function getTotalTransactions(fromMs, toMs, matches) {
  let count = 0;
  for (let i = 0; i < W_LENGTH; i++) {
    if (!matches(i)) continue;
    const ts = W_TIMESTAMPS[i];
    if (ts >= fromMs && ts <= toMs) count++;
  }
  return count;
}

function calculateAOV(fromMs, toMs, matches) {
  let totalValue = 0;
  let count = 0;
  for (let i = 0; i < W_LENGTH; i++) {
    if (!matches(i)) continue;

    const ts = W_TIMESTAMPS[i];
    if (ts < fromMs || ts > toMs) continue;
    if (W_STATUSES[i] !== STATUS_OK) continue;

    totalValue += W_QUANTITIES[i];
    count++;
  }
  return count === 0 ? 0 : totalValue / count;
}

function calculateSuccessRate(fromMs, toMs, matches) {
  let total = 0;
  let success = 0;

  for (let i = 0; i < W_LENGTH; i++) {
    if (!matches(i)) continue;

    const ts = W_TIMESTAMPS[i];
    if (ts < fromMs || ts > toMs) continue;

    total++;
    if (W_STATUSES[i] === STATUS_OK) success++;
  }

  return total === 0 ? 0 : (success / total) * 100;
}

function calculateTotalRevenue(fromMs, toMs, matches) {
  let total = 0;

  for (let i = 0; i < W_LENGTH; i++) {
    if (!matches(i)) continue;

    const ts = W_TIMESTAMPS[i];
    if (ts < fromMs || ts > toMs) continue;
    if (W_STATUSES[i] !== STATUS_OK) continue;

    total += W_QUANTITIES[i];
  }

  return total;
}

function aggregateTransactionsByDay(fromMs, toMs, matches) {
  const map = Object.create(null);

  for (let i = 0; i < W_LENGTH; i++) {
    if (!matches(i)) continue;
    const ts = W_TIMESTAMPS[i];
    if (ts < fromMs || ts > toMs) continue;

    const key = formatDateFromMs(ts);
    if (!map[key]) map[key] = { success: 0, pending: 0, fail: 0 };

    const s = W_STATUSES[i];
    if (s === STATUS_OK) map[key].success++;
    else if (s === STATUS_PENDING) map[key].pending++;
    else map[key].fail++;
  }

  return Object.keys(map)
    .sort()
    .map((date) => ({
      date,
      success: map[date].success,
      pending: map[date].pending,
      fail: map[date].fail,
    }));
}

function groupTransactionsByCountry(fromMs, toMs, matches) {
  const counts = new Map();

  for (let i = 0; i < W_LENGTH; i++) {
    if (!matches(i)) continue;
    const ts = W_TIMESTAMPS[i];
    if (ts < fromMs || ts > toMs) continue;

    const idx = W_COUNTRY_INDEX[i];
    const country = W_COUNTRIES[idx];

    counts.set(country, (counts.get(country) || 0) + 1);
  }

  const result = [];
  for (const [country, count] of counts.entries()) {
    result.push({ country, transactions: count, fill: "#2B9D90" });
  }
  return result;
}

function generateChartConfig() {
  const cfg = {};
  for (let i = 0; i < W_COUNTRIES.length; i++) {
    cfg[W_COUNTRIES[i]] = { label: W_COUNTRIES[i], color: `var(--chart-${(i % 6) + 1})` };
  }
  return cfg;
}

function aggregateRevenueByMonth(fromMs, toMs, matches) {
  const out = {};
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  for (let i = 0; i < W_LENGTH; i++) {
    if (!matches(i)) continue;
    const ts = W_TIMESTAMPS[i];
    if (ts < fromMs || ts > toMs) continue;
    if (W_STATUSES[i] !== STATUS_OK) continue;

    const m = new Date(ts).getMonth();
    out[m] = (out[m] || 0) + W_QUANTITIES[i];
  }

  return Object.keys(out).map((m) => ({
    month: months[m],
    revenue: out[m],
  }));
}

function calculateRevenueChangeValue(fromMs, toMs, matches) {
  const monthly = aggregateRevenueByMonth(fromMs, toMs, matches);
  if (monthly.length <= 1) return 0;

  const sorted = monthly.sort(
    (a, b) =>
      new Date(`${a.month} 1, 2024`).getTime() -
      new Date(`${b.month} 1, 2024`).getTime()
  );

  const last = sorted[sorted.length - 1].revenue;
  const prev = sorted.length > 1 ? sorted[sorted.length - 2].revenue : 0;

  return last - prev;
}

function calculateRevenueByCountry(fromMs, toMs, matches) {
  const resultMap = new Map();

  const week = 7 * 24 * 60 * 60 * 1000;
  const lastWeekStart = toMs - week;
  const prevWeekStart = toMs - week * 2;
  const prevWeekEnd = toMs - week;

  for (let i = 0; i < W_LENGTH; i++) {
    if (!matches(i)) continue;

    const ts = W_TIMESTAMPS[i];
    if (ts < fromMs || ts > toMs) continue;
    if (W_STATUSES[i] !== STATUS_OK) continue;

    const qty = W_QUANTITIES[i];
    const country = W_COUNTRIES[W_COUNTRY_INDEX[i]];

    if (!resultMap.has(country)) {
      resultMap.set(country, {
        totalRevenue: 0,
        lastWeekRevenue: 0,
        previousWeekRevenue: 0,
      });
    }

    const item = resultMap.get(country);
    item.totalRevenue += qty;

    if (ts >= lastWeekStart) item.lastWeekRevenue += qty;
    if (ts >= prevWeekStart && ts < prevWeekEnd) item.previousWeekRevenue += qty;
  }

  const result = [];
  for (const [country, r] of resultMap.entries()) {
    const prev = r.previousWeekRevenue;
    const curr = r.lastWeekRevenue;
    const pct = prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

    result.push({
      country,
      totalRevenue: Number(r.totalRevenue.toFixed(2)),
      lastWeekIncrease: Number(pct.toFixed(2)),
    });
  }

  return result;
}

function generateRevenueChartData(fromMs, toMs, matches) {
  const countrySet = new Set();
  const dateMap = new Map();

  for (let i = 0; i < W_LENGTH; i++) {
    if (!matches(i)) continue;
    const ts = W_TIMESTAMPS[i];
    if (ts < fromMs || ts > toMs) continue;

    if (W_STATUSES[i] !== STATUS_OK) continue;

    const date = formatDateFromMs(ts);
    const qty = W_QUANTITIES[i];
    const country = W_COUNTRIES[W_COUNTRY_INDEX[i]];

    countrySet.add(country);

    if (!dateMap.has(date)) dateMap.set(date, new Map());
    const cm = dateMap.get(date);
    cm.set(country, (cm.get(country) || 0) + qty);
  }

  const countries = [...countrySet].sort();
  const dates = [...dateMap.keys()].sort();
  const data = [];

  for (const d of dates) {
    const cm = dateMap.get(d);
    const entry = { date: d, total: 0 };
    for (const c of countries) {
      const rev = cm.get(c) || 0;
      entry[c] = Number(rev.toFixed(2));
      entry.total += rev;
    }
    entry.total = Number(entry.total.toFixed(2));
    data.push(entry);
  }

  const config = {
    total: { label: "Total Revenue", color: "hsl(var(--chart-3))" },
  };

  const COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4",
  ];

  countries.forEach((country, i) => {
    config[country] = {
      label: country,
      color: COLORS[i % COLORS.length],
    };
  });

  return { data, config };
}

function processTransactionData(fromMs, toMs, matches) {
  let success = 0,
    pending = 0,
    fail = 0;

  for (let i = 0; i < W_LENGTH; i++) {
    if (!matches(i)) continue;

    const ts = W_TIMESTAMPS[i];
    if (ts < fromMs || ts > toMs) continue;

    const s = W_STATUSES[i];
    if (s === STATUS_OK) success++;
    else if (s === STATUS_PENDING) pending++;
    else fail++;
  }

  return [
    { status: "success", count: success, fill: "var(--color-success)" },
    { status: "pending", count: pending, fill: "var(--color-pending)" },
    { status: "fail", count: fail, fill: "var(--color-fail)" },
  ];
}

function getLast5WeeksChartData(endMs, matches) {
  const week = 7 * 24 * 60 * 60 * 1000;
  const day = 24 * 60 * 60 * 1000;
  const result = [];

  for (let i = 4; i >= 0; i--) {
    const end = endMs - i * week;
    const start = end - week + day;

    let count = 0;
    for (let j = 0; j < W_LENGTH; j++) {
      if (!matches(j)) continue;
      const ts = W_TIMESTAMPS[j];
      if (ts >= start && ts <= end) count++;
    }

    result.push({ week: `Week ${5 - i}`, amount: count });
  }

  return result;
}

function getLast5WeeksAOVChartData(endMs, matches) {
  const week = 7 * 24 * 60 * 60 * 1000;
  const day = 24 * 60 * 60 * 1000;
  const result = [];

  for (let i = 4; i >= 0; i--) {
    const end = endMs - i * week;
    const start = end - week + day;

    const avg = calculateAOV(start, end, matches);
    result.push({ week: `Week ${5 - i}`, amount: avg });
  }

  return result;
}

function getLast5WeeksSuccessRateChartData(endMs, matches) {
  const week = 7 * 24 * 60 * 60 * 1000;
  const day = 24 * 60 * 60 * 1000;
  const result = [];

  for (let i = 4; i >= 0; i--) {
    const end = endMs - i * week;
    const start = end - week + day;

    const rate = calculateSuccessRate(start, end, matches);
    result.push({ week: `Week ${5 - i}`, amount: rate });
  }

  return result;
}

function calculateLastWeekIncrease(endMs, type, matches) {
  const week = 7 * 24 * 60 * 60 * 1000;
  const day = 24 * 60 * 60 * 1000;

  const currentEnd = endMs;
  const currentStart = currentEnd - week + day;
  const prevEnd = currentStart - day;
  const prevStart = prevEnd - week + day;

  const curr = [];
  const prev = [];

  for (let i = 0; i < W_LENGTH; i++) {
    if (!matches(i)) continue;

    const ts = W_TIMESTAMPS[i];
    if (ts >= currentStart && ts <= currentEnd) curr.push(i);
    else if (ts >= prevStart && ts <= prevEnd) prev.push(i);
  }

  function calcAOVLocal(indices) {
    if (indices.length === 0) return 0;
    let total = 0;
    for (const i of indices) total += W_QUANTITIES[i];
    return total / indices.length;
  }

  function calcSuccessLocal(indices) {
    if (indices.length === 0) return 0;
    let success = 0;
    for (const i of indices) {
      if (W_STATUSES[i] === STATUS_OK) success++;
    }
    return (success / indices.length) * 100;
  }

  let current, previous;

  if (type === "count") {
    current = curr.length;
    previous = prev.length;
  } else if (type === "aov") {
    current = calcAOVLocal(curr);
    previous = calcAOVLocal(prev);
  } else {
    current = calcSuccessLocal(curr);
    previous = calcSuccessLocal(prev);
  }

  const pct =
    previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;

  return {
    current,
    previous,
    percentage: pct,
  };
}

function computeFinancial(fromMs, toMs) {
  const indices = [];
  const merchantSet = new Set();

  for (let i = 0; i < W_LENGTH; i++) {
    const ts = W_TIMESTAMPS[i];
    if (ts < fromMs || ts > toMs) continue;

    if (W_STATUSES[i] !== STATUS_OK) continue;

    indices.push(i);

    const mIdx = W_MERCHANT_INDEX[i];
    merchantSet.add(W_MERCHANTS[mIdx]);
  }

  return { indices, merchants: [...merchantSet] };
}

self.onmessage = (event) => {
  const data = event.data || {};
  const type = data.type;

  try {
    if (type === "init") {
      const {
        length,
        timestamps,
        quantities,
        statuses,
        countryIndex,
        methodIndex,
        providerIndex,
        merchantIndex,
        countries,
        methods,
        providers,
        merchants,
      } = data;

      W_LENGTH = length;
      W_TIMESTAMPS = new Float64Array(timestamps);
      W_QUANTITIES = new Float32Array(quantities);
      W_STATUSES = new Uint8Array(statuses);
      W_COUNTRY_INDEX = new Uint16Array(countryIndex);
      W_METHOD_INDEX = new Uint16Array(methodIndex);
      W_PROVIDER_INDEX = new Uint16Array(providerIndex);
      W_MERCHANT_INDEX = new Uint16Array(merchantIndex);

      W_COUNTRIES = countries || [];
      W_METHODS = methods || [];
      W_PROVIDERS = providers || [];
      W_MERCHANTS = merchants || [];

      return;
    }

    if (type === "compute-financial") {
      const fromMs = data.from;
      const toMs = data.to;

      const result = computeFinancial(fromMs, toMs);

      self.postMessage({
        type: "financial-result",
        indices: result.indices,
        merchants: result.merchants,
      });

      return;
    }

    if (type === "compute") {
      const fromMs = data.from;
      const toMs = data.to;
      const filters = data.filters || [];

      const matches = buildFilterChecker(filters);

      const rowIndices = [];
      for (let i = 0; i < W_LENGTH; i++) {
        if (!matches(i)) continue;
        const ts = W_TIMESTAMPS[i];
        if (ts >= fromMs && ts <= toMs) rowIndices.push(i);
      }

      const totalTransactions = getTotalTransactions(fromMs, toMs, matches);
      const avgOrderValue = calculateAOV(fromMs, toMs, matches);
      const successRate = calculateSuccessRate(fromMs, toMs, matches);
      const totalRevenue = calculateTotalRevenue(fromMs, toMs, matches);

      const monthlyRevenue = aggregateRevenueByMonth(fromMs, toMs, matches);
      const revenueChange = calculateRevenueChangeValue(fromMs, toMs, matches);
      const revenueByCountry = calculateRevenueByCountry(fromMs, toMs, matches);
      let transactionsForChart = aggregateTransactionsByDay(fromMs, toMs, matches);
      const countriesData = groupTransactionsByCountry(fromMs, toMs, matches);
      let revenuByDay = generateRevenueChartData(fromMs, toMs, matches);
      const chartConfig = generateChartConfig();
      const trxRate = processTransactionData(fromMs, toMs, matches);

      const last5WeeksData = getLast5WeeksChartData(toMs, matches);
      const last5WeeksAOVData = getLast5WeeksAOVChartData(toMs, matches);
      const last5WeeksSuccessRateData = getLast5WeeksSuccessRateChartData(toMs, matches);

      const lastWeekIncreaseCount = calculateLastWeekIncrease(toMs, "count", matches);
      const lastWeekIncreaseAOV = calculateLastWeekIncrease(toMs, "aov", matches);
      const lastWeekIncreaseSuccessRate = calculateLastWeekIncrease(
        toMs,
        "successRate",
        matches
      );

      transactionsForChart = downsampleSeries(
        transactionsForChart,
        500,
        "date",
        ["success", "pending", "fail"]
      );

      revenuByDay = {
        data: downsampleSeries(revenuByDay.data, 500, "date", ["total"]),
        config: revenuByDay.config,
      };

      self.postMessage({
        type: "result",
        payload: {
          totalTransactions,
          avgOrderValue,
          successRate,
          totalRevenue,
          transactionByDateRange: [],
          monthlyRevenue,
          revenueChange,
          revenueByCountry,
          transactionsForChart,
          countriesData,
          revenuByDay,
          chartConfig,
          trxRate,
          last5WeeksData,
          last5WeeksAOVData,
          last5WeeksSuccessRateData,
          lastWeekIncreaseCount,
          lastWeekIncreaseAOV,
          lastWeekIncreaseSuccessRate,
          rowIndices,
        },
      });

      return;
    }
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err?.message || "Unknown worker error",
    });
  }
};
