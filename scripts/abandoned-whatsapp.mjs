// One-shot abandoned-enrollment WhatsApp follow-up trigger, run on a cron by the
// PM2 `afnan-abandoned-whatsapp` app (see ecosystem.config.js). It just calls the
// in-app sweep endpoint over localhost so all the real logic stays in the Next
// server. No-op unless WHATSAPP_ABANDONED_ENABLED=true (enforced server-side).
//
// Run by hand:
//   node --env-file=.env.local --env-file=.env scripts/abandoned-whatsapp.mjs

const secret = process.env.RECONCILE_SECRET;
if (!secret) {
  console.error('[abandoned-wa] RECONCILE_SECRET is not set — skipping.');
  process.exit(0); // not an error: feature is simply not configured
}

const port = process.env.PORT ?? '3000';
const url =
  process.env.ABANDONED_SWEEP_URL ?? `http://127.0.0.1:${port}/api/whatsapp/abandoned-sweep`;

try {
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${secret}` },
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`[abandoned-wa] HTTP ${res.status}: ${text}`);
    process.exit(1);
  }
  console.log(`[abandoned-wa] ${new Date().toISOString()} ${text}`);
  process.exit(0);
} catch (err) {
  console.error('[abandoned-wa] request failed:', err);
  process.exit(1);
}
