// backend/index.js
import "dotenv/config"; // MUST be first

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import watchlistRoutes from "./routes/watchlistRoutes.js";
import alertRoutes from "./routes/alerts.js";
import coinsRoutes from "./routes/coins.routes.js"; // NEW
import { verifySmtp } from "./services/email.js";    // NEW
import { startAlertJobs } from "./jobs/alerts.js";   // If your jobs file exports this
import listEndpoints from "express-list-endpoints";


const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// Health & (optional) debug
app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Routes
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/coins", coinsRoutes); // NEW proxy for CoinGecko

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    await verifySmtp();   // fail fast if SMTP is misconfigured
    startAlertJobs?.();   // ignore if you haven’t added it yet

    app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
}
main();
console.log(listEndpoints(app));
