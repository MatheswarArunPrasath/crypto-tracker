import axios from "axios";

export async function getCoinsByIds(ids = []) {
  if (!ids.length) return [];

  try {
    const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "inr",
        ids: ids.join(","),     // ✅ only needed coins
        order: "market_cap_desc",
        sparkline: false,
        price_change_percentage: "24h",
      },
      timeout: 30000,
    });

    return res.data;
  } catch (err) {
    console.error("getCoinsByIds failed:", err?.response?.status, err?.message);
    return [];
  }
}
