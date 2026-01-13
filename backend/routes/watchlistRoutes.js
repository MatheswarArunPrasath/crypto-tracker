import express from "express";
import Watchlist from "../models/Watchlist.js";

const router = express.Router();

/**
 * GET /api/watchlist/:userId
 * Returns a flat array of coin ids, e.g. ["bitcoin","ethereum"]
 */
router.get("/:userId", async (req, res) => {
  try {
    const doc = await Watchlist.findOne({ userId: req.params.userId });
    return res.status(200).json(doc ? doc.coins : []);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/watchlist/add
 * Body: { userId, coinId }
 * Returns the updated array of coin ids
 */
router.post("/add", async (req, res) => {
  try {
    const { userId, coinId } = req.body;
    if (!userId || !coinId) {
      return res.status(400).json({ error: "Missing userId or coinId" });
    }

    const doc = await Watchlist.findOne({ userId });

    if (!doc) {
      const created = await Watchlist.create({ userId, coins: [coinId] });
      return res.status(201).json(created.coins);
    }

    if (!doc.coins.includes(coinId)) {
      doc.coins.push(coinId);
      await doc.save();
    }

    return res.status(200).json(doc.coins);
  } catch (e) {
    return res.status(500).json({ error: "Failed to add item" });
  }
});

/**
 * POST /api/watchlist/remove
 * Body: { userId, coinId }
 * Returns the updated array of coin ids
 */
router.post("/remove", async (req, res) => {
  try {
    const { userId, coinId } = req.body;
    if (!userId || !coinId) {
      return res.status(400).json({ error: "Missing userId or coinId" });
    }

    const doc = await Watchlist.findOne({ userId });

    if (doc) {
      doc.coins = doc.coins.filter((id) => id !== coinId);
      await doc.save();
      return res.status(200).json(doc.coins);
    }

    return res.status(200).json([]);
  } catch (e) {
    return res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
