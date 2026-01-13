import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { motion } from "framer-motion";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function safeParseJSON(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function formatINR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-IN");
}

function Grid({ coin, delay }) {
  const [isCoinAdded, setIsCoinAdded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Parse user safely (prevents crashes if localStorage has invalid JSON)
  const user = safeParseJSON(localStorage.getItem("user"));
  const userId = user?.sub;

  // Safe numeric computations (prevents blank screen)
  const change24h = Number(coin?.price_change_percentage_24h);
  const hasChange = Number.isFinite(change24h);
  const red = hasChange ? change24h < 0 : false;

  useEffect(() => {
  let cancelled = false;

  const fetchState = async () => {
    // If logged out, reset UI state immediately
    if (!userId || !coin?.id) {
      if (!cancelled) {
        setIsCoinAdded(false);
        setIsSubscribed(false);
      }
      return;
    }

    try {
      const [wlRes, alRes] = await Promise.all([
        axios.get(`/api/watchlist/${userId}`),
        axios.get(`/api/alerts/settings/${userId}`).catch((err) => {
          // Treat 404 as "no alerts yet"
          if (err?.response?.status === 404) return { data: [] };
          throw err;
        }),
      ]);

      if (cancelled) return;

      // Watchlist response can be array OR {watchlist: []}
      const wlData = wlRes.data;
      const watch = Array.isArray(wlData) ? wlData : wlData?.watchlist;
      setIsCoinAdded(Boolean(watch?.includes(coin.id)));

      // Alerts response is expected as array
      const alData = alRes.data;
      const entry = Array.isArray(alData)
        ? alData.find((a) => a.coinId === coin.id && a.active)
        : null;

      setIsSubscribed(!!entry);
    } catch (err) {
      if (!cancelled) console.error("Failed to fetch state", err);
    }
  };

  fetchState();

  return () => {
    cancelled = true;
  };
}, [coin?.id, userId]);

  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !userId) {
      toast.warning("Please sign in to manage your Watchlist!");
      return;
    }

    try {
      if (isCoinAdded) {
        await axios.post("/api/watchlist/remove", { userId, coinId: coin.id });
        toast.info(`${coin?.name ?? "Coin"} removed from watchlist`);
      } else {
        await axios.post("/api/watchlist/add", { userId, coinId: coin.id });
        toast.success(`${coin?.name ?? "Coin"} added to watchlist`);
      }
      setIsCoinAdded((prev) => !prev);
    } catch (err) {
      console.error(err);
      toast.error("Watchlist update failed");
    }
  };

  const handleBellClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !userId) {
      toast.warning("Please sign in to manage alerts!");
      return;
    }

    try {
      if (!isSubscribed) {
        const input = window.prompt(
          `Set alert for ${coin?.name ?? "this coin"} when move ≥ X% (default 1):`,
          "1"
        );
        if (input === null) return;

        const thresholdPct = Number(input);
        if (!Number.isFinite(thresholdPct) || thresholdPct <= 0) {
          toast.error("Please enter a valid positive number.");
          return;
        }

        const dirInput = window.prompt(
          `Direction? Type: up / down / both (default both):`,
          "both"
        );
        const direction = (dirInput || "both").toLowerCase();
        if (!["up", "down", "both"].includes(direction)) {
          toast.error("Invalid direction. Use: up, down, or both.");
          return;
        }

        await axios.post("/api/alerts/subscribe", {
          userId,
          email: user?.email,
          coinId: coin.id,
          thresholdPct,
          direction,
          frequency: "immediate",
        });

        setIsSubscribed(true);
        toast.success(`Subscribed to ${coin?.name ?? "coin"} alerts. Check your inbox!`);
      } else {
        await axios.post("/api/alerts/toggle", {
          userId,
          coinId: coin.id,
          active: false,
        });
        setIsSubscribed(false);
        toast.info(`Unsubscribed from ${coin?.name ?? "coin"} alerts.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Alert action failed");
    }
  };

  return (
    <Link to={`/coin/${coin?.id}`} style={{ textDecoration: "none" }}>
      <motion.div
        className={`grid ${red ? "grid-red" : ""}`}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <div className="img-flex">
          <img
            src={coin?.image}
            className="coin-image"
            alt={`${coin?.name ?? "Coin"} logo`}
          />

          <div className="icon-flex">
            <div className="info-flex">
              <p className="coin-symbol">{coin?.symbol ?? ""}</p>
              <p className="coin-name">{coin?.name ?? ""}</p>
            </div>

            <div className="actions-flex" style={{ display: "flex", gap: 10 }}>
              <div
                className={`watchlist-icon ${red ? "watchlist-icon-red" : ""}`}
                onClick={handleWatchlistToggle}
                title={isCoinAdded ? "Remove from watchlist" : "Add to watchlist"}
                role="button"
              >
                {isCoinAdded ? <StarIcon /> : <StarOutlineIcon />}
              </div>

              <div
                className={`alert-icon ${red ? "watchlist-icon-red" : ""}`}
                onClick={handleBellClick}
                title={isSubscribed ? "Unsubscribe from alerts" : "Subscribe to alerts"}
                role="button"
                style={{ display: "flex", alignItems: "center" }}
              >
                {isSubscribed ? (
                  <NotificationsActiveRoundedIcon />
                ) : (
                  <NotificationsNoneRoundedIcon />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="chip-flex">
          <div className={`price-chip ${red ? "red" : ""}`}>
            {hasChange ? `${change24h.toFixed(2)}%` : "0.00%"}
          </div>
          <div className={`chip-icon ${red ? "red" : ""}`}>
            {red ? <TrendingDownRoundedIcon /> : <TrendingUpRoundedIcon />}
          </div>
        </div>

        <p className={red ? "current-price-red" : "current-price"}>
          ₹{formatINR(coin?.current_price)}
        </p>
        <p className="coin-name">Total Volume : ₹{formatINR(coin?.total_volume)}</p>
        <p className="coin-name">Market Capital : ₹{formatINR(coin?.market_cap)}</p>
      </motion.div>
    </Link>
  );
}

export default Grid;
