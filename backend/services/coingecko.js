import axios from "axios";
import axiosRetry from "axios-retry";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 30, checkperiod: 15 }); // 30s cache

const cg = axios.create({
  baseURL: process.env.COINGECKO_BASE || "https://api.coingecko.com/api/v3",
  timeout: 10000,
  headers: process.env.CG_API_KEY ? { "x-cg-demo-api-key": process.env.CG_API_KEY } : {},
});

axiosRetry(cg, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (err) =>
    err.response?.status === 429 ||
    err.code === "ECONNABORTED" ||
    err.message?.includes("timeout"),
});

export async function getMarkets({ vs_currency = "inr", per_page = 100, page = 1 }) {
  const key = `markets:${vs_currency}:${per_page}:${page}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const { data } = await cg.get("/coins/markets", {
    params: { vs_currency, order: "market_cap_desc", per_page, page, sparkline: false },
  });

  cache.set(key, data);
  return data;
}

// ✅ NEW: Search coins (CoinGecko /search)
// GET /api/coins/search?q=btc
export async function searchCoins(q) {
  const query = (q || "").trim();
  if (!query) return { coins: [] };

  const key = `search:${query.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const { data } = await cg.get("/search", {
    params: { query },
  });

  cache.set(key, data);
  return data;
}
