import mongoose from "mongoose";

const AlertSettingSchema = new mongoose.Schema({
  userId: { type: String, index: true, required: true }, // Google sub
  email:  { type: String, required: true },
  coinId: { type: String, index: true, required: true },

  thresholdPct: { type: Number, default: 5 },            // 5% by default
  direction: { type: String, enum: ["up", "down", "both"], default: "both" },
  active: { type: Boolean, default: true },
  frequency: { type: String, enum: ["immediate", "daily"], default: "immediate" },

  lastNotifiedAt: { type: Date },   // used for throttling
  lastNotifiedPrice: { type: Number }
}, { timestamps: true });

AlertSettingSchema.index({ userId: 1, coinId: 1 }, { unique: true });

export default mongoose.model("AlertSetting", AlertSettingSchema);
