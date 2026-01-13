import { toast } from "react-toastify";
import axios from "axios";

const userId = "demo-user"; // TODO: Replace with dynamic user ID after auth is implemented

export const saveItemToWatchlist = async (e, coins, setIsCoinAdded) => {
  e.preventDefault();
  e.stopPropagation(); // Prevents opening coin link if inside <a>

  try {
    await axios.post("/api/watchlist/add", {
      userId,
      coins,
    });

    if (setIsCoinAdded) setIsCoinAdded(true);

    toast.success(`${coins.charAt(0).toUpperCase() + coins.slice(1)} added to watchlist`);
  } catch (error) {
    console.error("Add to watchlist error:", error);

    const errMsg = error.response?.data?.message || "Could not be added";
    toast.error(`${coins.charAt(0).toUpperCase() + coins.slice(1)} - ${errMsg}`);
  }
};
