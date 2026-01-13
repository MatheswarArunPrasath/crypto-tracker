export function welcomeHtml({ coinId, thresholdPct, unsubLink }) {
  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,Arial;max-width:560px;margin:auto;border:1px solid #eee;border-radius:12px;padding:16px">
    <h2 style="margin:0 0 8px">🔔 Alerts Enabled</h2>
    <p>You will receive emails when <b>${coinId}</b> moves beyond <b>±${thresholdPct}%</b>.</p>
    <p style="font-size:12px;color:#555">You can unsubscribe anytime:</p>
    <p><a href="${unsubLink}" style="color:#0b57d0">Unsubscribe</a></p>
  </div>`;
}
