import React, { useEffect, useState } from "react";
import Header from "../components/common/Header/header";
import TabsComponent from "../components/dashboard/Tabs/TabsComponent";
import Button from "../components/common/Button/Button";
import axios from "axios";
import { toast } from "react-toastify";

const safeParseJSON = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

// Fetch ONLY watchlist coins (faster than get100Coins)
const getCoinsByIds = async (ids = []) => {
  if (!ids.length) return [];
  try {
    const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "inr",
        ids: ids.join(","), // ✅ only required coins
        order: "market_cap_desc",
        sparkline: false,
        price_change_percentage: "24h",
      },
      timeout: 30000, // ✅ avoid 10s timeout
    });
    return res.data || [];
  } catch (err) {
    console.error("CoinGecko fetch failed:", err?.response?.status, err?.message);
    return [];
  }
};

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ read localStorage safely
  const user = safeParseJSON(localStorage.getItem("user"));
  const userId = user?.sub;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      // 🔒 Not logged in
      if (!userId) {
        if (!cancelled) {
          setWatchlist([]);
          setCoins([]);
          setLoading(false);
        }
        return;
      }

      try {
        // 1) Fetch watchlist IDs from your DB
        const res = await axios.get(`/api/watchlist/${userId}`);

        // supports: array OR {watchlist: []}
        const ids = Array.isArray(res.data) ? res.data : res.data?.watchlist || [];

        if (cancelled) return;

        setWatchlist(ids);

        // 2) Fetch only those coins from CoinGecko
        const coinData = await getCoinsByIds(ids);

        if (cancelled) return;

        setCoins(coinData);
      } catch (err) {
        console.error(err);
        if (!cancelled) toast.error("Failed to fetch watchlist data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 🕐 Loading state
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <Header />
        <h2>Loading your Watchlist...</h2>
      </div>
    );
  }

  // 🔒 If not logged in
  if (!userId) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <Header />
        <h2>Please sign in to view your Watchlist 🔒</h2>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          <a href="/dashboard">
            <Button text="Go to Dashboard" />
          </a>
        </div>
      </div>
    );
  }

  // ✅ Main Watchlist Page
  return (
    <div>
      <Header />
      {watchlist?.length > 0 ? (
        <TabsComponent coins={coins} />
      ) : (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
          <h2>Your Watchlist is empty 🕳️</h2>
          <p>Add coins from the Dashboard to see them here!</p>
          <div style={{ display: "flex", justifyContent: "center", margin: "2rem" }}>
            <a href="/dashboard">
              <Button text="Go to Dashboard" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
