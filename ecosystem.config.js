// PM2 process definition for the Next.js production server.
// NOTE: scripts/deploy.sh does NOT use this file — it reloads the running
// `afnan-website` process by name. This file documents the process config and
// is here for a manual `pm2 start ecosystem.config.js` on a fresh box. The web
// app name is kept in sync with the live process (`afnan-website`) so a manual
// startOrReload reloads it instead of spawning a duplicate server on port 3000.
module.exports = {
  apps: [
    {
      name: 'afnan-website',
      // Run the Next.js CLI directly (more reliable under PM2 than `npm start`).
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
    },
    {
      // Payment reconciliation sweep. EPS has no IPN/webhook, so this cron is the
      // safety net that recovers charged-but-not-finalized orders. It runs the
      // one-shot script every 3 minutes (autorestart off; cron_restart drives it)
      // which hits the in-app /api/payment/reconcile endpoint over localhost.
      name: 'afnan-reconcile',
      script: 'scripts/reconcile-payments.mjs',
      // Load the same env files the standalone scripts use, so RECONCILE_SECRET /
      // EPS creds are available without baking secrets into this file.
      interpreter: 'node',
      interpreter_args: '--env-file=.env.local --env-file=.env',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: false,
      cron_restart: '*/3 * * * *',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
    },
    {
      // Abandoned-enrollment WhatsApp follow-up sweep. Runs the one-shot script
      // every 2 minutes (autorestart off; cron_restart drives it), which hits
      // the in-app /api/whatsapp/abandoned-sweep endpoint over localhost. No-op
      // until WHATSAPP_ABANDONED_ENABLED=true (i.e. the enroll_followup template
      // is approved).
      name: 'afnan-abandoned-whatsapp',
      script: 'scripts/abandoned-whatsapp.mjs',
      interpreter: 'node',
      interpreter_args: '--env-file=.env.local --env-file=.env',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: false,
      cron_restart: '*/2 * * * *',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
    },
  ],
};
