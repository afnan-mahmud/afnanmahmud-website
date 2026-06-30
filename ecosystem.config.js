// PM2 process definition for the Next.js production server.
// Started/reloaded by scripts/deploy.sh via `pm2 startOrReload ecosystem.config.js`.
module.exports = {
  apps: [
    {
      name: 'afnan-web',
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
  ],
};
