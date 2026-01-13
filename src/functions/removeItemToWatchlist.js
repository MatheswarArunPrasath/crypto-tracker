import { toast } from "react-toastify";
import axios from "axios";

const userId = "demo-user"; // Replace this with real userId later

export const removeItemToWatchlist = async (e, coins, setIsCoinAdded) => {
  e.preventDefault();

  if (window.confirm("Are you sure you want to remove this coin?")) {
    try {
      // Use POST instead of DELETE for body-safe operations
      await axios.post("/api/watchlist/remove", {
        userId,
        coins,
      });

      setIsCoinAdded(false);

      toast.success(
        `${coins.charAt(0).toUpperCase() + coins.slice(1)} - has been removed!`
      );

      // Optional: Refresh page or re-fetch data
      window.location.reload();
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      toast.error(
        `${coins.charAt(0).toUpperCase() + coins.slice(1)} - could not be removed!`
      );
      setIsCoinAdded(true);
    }
  } else {
    toast.info(`${coins.charAt(0).toUpperCase() + coins.slice(1)} - removal cancelled!`);
    setIsCoinAdded(true);
  }
};
