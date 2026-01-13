import express from "express";
import { getMarkets, searchCoins } from "../services/coingecko.js";


const router = express.Router();

// ✅ SEARCH: /api/coins/search?q=btc
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ coins: [] });

    const data = await searchCoins(q);
    res.set("Cache-Control", "public, max-age=15");
    res.json(data);
  } catch (e) {
    if (e.response?.status === 429) {
      return res.status(429).json({ error: "Rate limited by CoinGecko. Please retry shortly." });
    }
    return res.status(502).json({ error: "Upstream error", detail: e.message });
  }
});

// EXISTING: /api/coins/markets
router.get("/markets", async (req, res) => {
  try {
    const vs_currency = (req.query.vs_currency || "inr").toLowerCase();
    const per_page = Number(req.query.per_page || 100);
    const page = Number(req.query.page || 1);

    const data = await getMarkets({ vs_currency, per_page, page });
    res.set("Cache-Control", "public, max-age=15");
    res.json(data);
  } catch (e) {
    if (e.response?.status === 429) {
      return res.status(429).json({ error: "Rate limited by CoinGecko. Please retry shortly." });
    }
    return res.status(502).json({ error: "Upstream error", detail: e.message });
  }
});

export default router;
