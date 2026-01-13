const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export async function subscribeAlert({ userId, email, coinId, thresholdPct }: {
  userId: string; email: string; coinId: string; thresholdPct: number;
}) {
  const res = await fetch(`${BASE}/api/alerts/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, coinId, thresholdPct, direction: "both", frequency: "immediate" })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function toggleAlert({ userId, coinId, active }: {
  userId: string; coinId: string; active: boolean;
}) {
  const res = await fetch(`${BASE}/api/alerts/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, coinId, active })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
