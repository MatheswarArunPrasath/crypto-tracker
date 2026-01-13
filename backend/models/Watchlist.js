import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    coins: { type: [String], default: [] }, // unified field name
  },
  { timestamps: true }
);

const Watchlist = mongoose.model("Watchlist", watchlistSchema);
export default Watchlist;
