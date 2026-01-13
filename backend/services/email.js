// backend/services/email.js
import nodemailer from "nodemailer";

const EMAIL_DEBUG = String(process.env.EMAIL_DEBUG || "false").toLowerCase() === "true";
let transporter;

function getTransporter() {
  if (!transporter) {
    const {
      SMTP_HOST = "smtp.gmail.com",
      SMTP_PORT = "587",
      SMTP_USER,
      SMTP_PASS,
      SMTP_SECURE, // "true" for SMTPS/465
    } = process.env;

    console.log("[email] init transporter with:", {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER: SMTP_USER ? "(set)" : "(missing)",
      SMTP_SECURE: SMTP_SECURE || "false",
    });

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE).toLowerCase() === "true" || Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      logger: EMAIL_DEBUG,
      debug: EMAIL_DEBUG,
    });
  }
  return transporter;
}

function getFrom() {
  return process.env.FROM_EMAIL || `Crypto Tracker Alerts <${process.env.SMTP_USER}>`;
}

/* ------------------ Public API ------------------ */

export async function sendAlertEmail({ to, subject, html }) {
  return getTransporter().sendMail({ from: getFrom(), to, subject, html });
}

export async function sendWelcomeEmail({ to, coinId, thresholdPct, unsubLink }) {
  const subject = `🔔 Alerts enabled for ${coinId}`;
  const html = renderWelcomeHtml({ coinId, thresholdPct, unsubLink });
  return sendAlertEmail({ to, subject, html });
}

export async function verifySmtp() {
  try {
    await getTransporter().verify();
    console.log("[email] SMTP connection OK");
  } catch (e) {
    console.error("[email] SMTP verify failed:", e.message);
  }
}

/* ------------------ Templates & utils ------------------ */

function renderWelcomeHtml({ coinId, thresholdPct, unsubLink }) {
  const safeCoin = escapeHtml(coinId);
  const pct = Number(thresholdPct ?? 1).toFixed(2);
  const unsubHtml = unsubLink
    ? `<p style="margin-top:12px"><a href="${escapeAttr(unsubLink)}" style="color:#0b57d0">Unsubscribe</a></p>`
    : "";
  return `
    <div style="font-family:system-ui,Segoe UI,Roboto,Arial;max-width:560px;margin:auto;border:1px solid #eee;border-radius:12px;padding:16px">
      <h2 style="margin:0 0 8px">🔔 Alerts Enabled</h2>
      <p>You will receive emails when <b>${safeCoin}</b> moves beyond <b>±${pct}%</b>.</p>
      <p style="font-size:12px;color:#555">You can unsubscribe anytime using the link below.</p>
      ${unsubHtml}
    </div>`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(s) {
  return escapeHtml(s).replaceAll("(", "&#40;").replaceAll(")", "&#41;");
}
