import express from "express";
import AlertSetting from "../models/AlertSetting.js";
import { sendWelcomeEmail, sendAlertEmail } from "../services/email.js";
import { signUnsubToken, verifyUnsubToken } from "../services/token.js";

const router = express.Router();

// --- SUBSCRIBE via bell icon ---
router.post("/subscribe", async (req, res) => {
  try {
    const {
      userId,
      email,
      coinId,
      thresholdPct = Number(process.env.ALERT_DEFAULT_THRESHOLD || 5),
      direction = "both",
      frequency = "immediate"
    } = req.body;

    if (!userId || !email || !coinId) {
      return res.status(400).json({ error: "userId, email, coinId required" });
    }

    // Upsert + (re)activate alerts
    const doc = await AlertSetting.findOneAndUpdate(
      { userId, coinId },
      {
        $set: {
          email,
          thresholdPct: Number(thresholdPct),
          direction,
          active: true,
          frequency
        }
      },
      { upsert: true, new: true }
    );

    // Build unsubscribe link
    const token = signUnsubToken({ userId, email, coinId, typ: "unsub" });
    const base = process.env.APP_BASE_URL || "http://localhost:5000";
    const unsubLink = `${base}/api/alerts/unsubscribe/${token}`;

    // Send welcome email (fire & forget, but we await here to surface errors during dev)
    await sendWelcomeEmail({ to: email, coinId, thresholdPct: doc.thresholdPct, unsubLink });

    return res.json({ ok: true, setting: doc, unsubLink });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// --- UNSUBSCRIBE via email link ---
router.get("/unsubscribe/:token", async (req, res) => {
  try {
    const payload = verifyUnsubToken(req.params.token);
    const { userId, coinId, email } = payload;

    await AlertSetting.findOneAndUpdate(
      { userId, coinId, email },
      { $set: { active: false } },
      { new: true }
    );

    // optional: send confirmation email
    try {
      await sendAlertEmail({
        to: email,
        subject: `🔕 Unsubscribed from ${coinId} alerts`,
        html: `<p>You will no longer receive alerts for <b>${coinId}</b>. You can re-subscribe anytime from the app.</p>`
      });
    } catch { /* ignore */ }

    // simple confirmation page
    res.setHeader("Content-Type", "text/html");
    return res.send(`<p style="font-family:system-ui">You have unsubscribed from <b>${coinId}</b> alerts. You can close this tab.</p>`);
  } catch (e) {
    return res.status(400).send(`<p style="font-family:system-ui">Invalid or expired link.</p>`);
  }
});

// --- OPTIONAL: toggle from UI (bell on/off) ---
router.post("/toggle", async (req, res) => {
  try {
    const { userId, coinId, active } = req.body;
    if (!userId || !coinId || typeof active !== "boolean") {
      return res.status(400).json({ error: "userId, coinId, active required" });
    }

    const doc = await AlertSetting.findOneAndUpdate(
      { userId, coinId },
      { $set: { active } },
      { new: true, upsert: true } // ✅ important
    );

    return res.json({ ok: true, setting: doc });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});


router.get("/settings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const settings = await AlertSetting.find({ userId });
    return res.json(settings || []);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
