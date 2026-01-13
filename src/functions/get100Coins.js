import axios from "axios";

export async function get100Coins() {
  try {
    const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "inr",
        order: "market_cap_desc",
        per_page: 100,
        page: 1,
        sparkline: false,
        price_change_percentage: "24h",
      },
      timeout: 30000, // ✅ increase to 30s
    });

    return res.data;
  } catch (err) {
    console.error("get100Coins failed:", err?.response?.status, err?.message);
    return []; // ✅ prevent page crash
  }
}
