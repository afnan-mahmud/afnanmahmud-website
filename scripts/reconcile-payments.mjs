// One-shot payment reconciliation trigger, run on a cron by the PM2 `reconcile`
// app (see ecosystem.config.js). It simply calls the in-app reconcile endpoint
// over localhost so all the real EPS/enrollment logic stays in the Next server.
//
// Run by hand:
//   node --env-file=.env.local --env-file=.env scripts/reconcile-payments.mjs

const secret = process.env.RECONCILE_SECRET;
if (!secret) {
  console.error('[reconcile] RECONCILE_SECRET is not set — skipping.');
  process.exit(0); // not an error: feature is simply not configured
}

const port = process.env.PORT ?? '3000';
const url = process.env.RECONCILE_URL ?? `http://127.0.0.1:${port}/api/payment/reconcile`;

try {
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${secret}` },
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`[reconcile] HTTP ${res.status}: ${text}`);
    process.exit(1);
  }
  console.log(`[reconcile] ${new Date().toISOString()} ${text}`);
  process.exit(0);
} catch (err) {
  console.error('[reconcile] request failed:', err);
  process.exit(1);
}
