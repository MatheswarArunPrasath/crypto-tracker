import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import nodeCron from "node-cron";
import AlertSetting from "../models/AlertSetting.js";
import { getPricesINR } from "../services/prices.js";
import { sendAlertEmail } from "../services/email.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = process.env.TIMEZONE || "Asia/Kolkata";
const COOLDOWN_MIN = Number(process.env.ALERT_COOLDOWN_MINUTES || 60);
const DAILY_DIGEST_HOUR = Number(process.env.DAILY_DIGEST_HOUR || 9);

function shouldNotifyDirection(changePct, direction) {
  if (direction === "up") return changePct >= 0;
  if (direction === "down") return changePct <= 0;
  return true; // "both"
}

function pctChange(from, to) {
  if (from == null || from === 0) return 0;
  return ((to - from) / from) * 100;
}

function inCooldown(lastAt) {
  if (!lastAt) return false;
  return dayjs().diff(dayjs(lastAt), "minute") < COOLDOWN_MIN;
}

function rowHtml({ coinId, prev, curr, changePct, _24h }) {
  return `
    <tr>
      <td style="padding:6px 10px">${coinId}</td>
      <td style="padding:6px 10px">${prev?.toLocaleString("en-IN") ?? "-"}</td>
      <td style="padding:6px 10px">${curr?.toLocaleString("en-IN")}</td>
      <td style="padding:6px 10px">${changePct.toFixed(2)}%</td>
      <td style="padding:6px 10px">${(_24h ?? 0).toFixed(2)}%</td>
    </tr>`;
}

/** Immediate alerts every 2 minutes */
function scheduleImmediateAlerts() {
  nodeCron.schedule("*/2 * * * *", async () => {
    try {
      const active = await AlertSetting.find({ active: true, frequency: "immediate" });
      if (!active.length) return;

      // group by user => collect coinIds for batched price fetch
      const byUser = active.reduce((m, a) => {
        m[a.userId] = m[a.userId] || { email: a.email, items: [] };
        m[a.userId].items.push(a);
        return m;
      }, {});

      // Collect unique coin ids across all users
      const allCoinIds = [...new Set(active.map(a => a.coinId))];
      const priceMap = await getPricesINR(allCoinIds); // { bitcoin: { inr, inr_24h_change } }

      for (const [userId, { email, items }] of Object.entries(byUser)) {
        for (const it of items) {
          const p = priceMap[it.coinId];
          if (!p) continue;
          const current = p.inr;

          // Initialize baseline silently on first run
          if (it.lastNotifiedPrice == null) {
            it.lastNotifiedPrice = current;
            it.lastNotifiedAt = new Date();
            await it.save();
            continue;
          }

          const change = pctChange(it.lastNotifiedPrice, current);
          const absChange = Math.abs(change);
          const threshold = Number(it.thresholdPct ?? process.env.ALERT_DEFAULT_THRESHOLD ?? 5);

          if (absChange >= threshold &&
              shouldNotifyDirection(change, it.direction) &&
              !inCooldown(it.lastNotifiedAt)) {

            const subject = `💹 ${it.coinId} moved ${change > 0 ? "↑" : "↓"} ${absChange.toFixed(2)}%`;
            const html = `
              <div style="font-family:system-ui,Segoe UI,Roboto,Arial;max-width:560px;margin:auto;border:1px solid #eee;border-radius:12px;padding:12px">
                <h2 style="margin:0 0 8px">Price Alert Triggered</h2>
                <p style="margin:0 12px">Your threshold: ±${threshold}% (${it.direction}).</p>
                <table style="width:100%;border-collapse:collapse">
                  <tr><td style="padding:6px 10px">Coin</td><td style="padding:6px 10px;text-align:right">${it.coinId}</td></tr>
                  <tr><td style="padding:6px 10px">Previous ref</td><td style="padding:6px 10px;text-align:right">${it.lastNotifiedPrice.toLocaleString("en-IN",{style:"currency",currency:"INR"})}</td></tr>
                  <tr><td style="padding:6px 10px">Current</td><td style="padding:6px 10px;text-align:right">${current.toLocaleString("en-IN",{style:"currency",currency:"INR"})}</td></tr>
                  <tr><td style="padding:6px 10px">Move</td><td style="padding:6px 10px;text-align:right">${change.toFixed(2)}%</td></tr>
                </table>
              </div>`;

            await sendAlertEmail({ to: email, subject, html });

            // Reset baseline & timestamp
            it.lastNotifiedPrice = current;
            it.lastNotifiedAt = new Date();
            await it.save();
          }
        }
      }
    } catch (e) {
      console.error("[alerts] immediate job failed:", e?.message || e);
    }
  }, { timezone: TZ });
}

/** Daily digest at configured hour (optional) */
function scheduleDailyDigest() {
  nodeCron.schedule(`0 ${DAILY_DIGEST_HOUR} * * *`, async () => {
    try {
      const daily = await AlertSetting.find({ active: true, frequency: "daily" });
      if (!daily.length) return;

      const byUser = daily.reduce((m, a) => {
        m[a.userId] = m[a.userId] || { email: a.email, items: [] };
        m[a.userId].items.push(a);
        return m;
      }, {});

      const allCoinIds = [...new Set(daily.map(a => a.coinId))];
      const priceMap = await getPricesINR(allCoinIds);

      for (const { email, items } of Object.values(byUser)) {
        const rows = items.map(it => {
          const p = priceMap[it.coinId] || {};
          const current = p.inr;
          const _24h = p.inr_24h_change ?? 0;
          const change = pctChange(it.lastNotifiedPrice ?? current, current);
          return rowHtml({ coinId: it.coinId, prev: it.lastNotifiedPrice, curr: current, changePct: change, _24h });
        }).join("");

        if (!rows) continue;

        await sendAlertEmail({
          to: email,
          subject: "📬 Your Crypto Daily Digest",
          html: `
            <div style="font-family:system-ui,Segoe UI,Roboto,Arial;max-width:640px;margin:auto;border:1px solid #eee;border-radius:12px;padding:12px">
              <h2 style="margin:0 0 8px">Daily Watchlist Summary</h2>
              <table style="width:100%;border-collapse:collapse">
                <thead>
                  <tr>
                    <th align="left" style="padding:6px 10px">Coin</th>
                    <th align="left" style="padding:6px 10px">Prev Ref</th>
                    <th align="left" style="padding:6px 10px">Current</th>
                    <th align="left" style="padding:6px 10px">Move vs Ref</th>
                    <th align="left" style="padding:6px 10px">24h Change</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`,
        });
      }
    } catch (e) {
      console.error("[alerts] daily digest job failed:", e?.message || e);
    }
  }, { timezone: TZ });
}

export function startAlertJobs() {
  scheduleImmediateAlerts();
  scheduleDailyDigest();
  console.log(`[alerts] jobs scheduled (immediate */2 * * * *; daily ${DAILY_DIGEST_HOUR}:00) in ${TZ}`);
}
