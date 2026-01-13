import axios from "axios";

let cache = { at: 0, dataByIds: {} }; // simple 1-min cache

export async function getPricesINR(coinIds) {
  const now = Date.now();
  const TTL = 60_000; // 1 minute

  // if cached and same set of ids, reuse
  const key = coinIds.sort().join(",");
  if (cache.dataByIds[key] && now - cache.at < TTL) {
    return cache.dataByIds[key];
  }

  if (!coinIds.length) return {};

  // CoinGecko supports batching ids with comma
  const ids = coinIds.join(",");
  const url = "https://api.coingecko.com/api/v3/simple/price";

  const { data } = await axios.get(url, {
    params: {
      ids,
      vs_currencies: "inr",
      include_24hr_change: true,
    },
    timeout: 12000,
  });

  cache.at = now;
  cache.dataByIds[key] = data || {};
  return cache.dataByIds[key];
}
