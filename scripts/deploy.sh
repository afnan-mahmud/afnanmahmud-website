#!/usr/bin/env bash
# Pull the latest main, rebuild, and reload the app under PM2 with zero downtime.
# Run from anywhere — it cd's to the repo root relative to its own location.
# Used by .github/workflows/deploy.yml, and can also be run by hand on the server.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "▶ Pulling latest code…"
git pull --ff-only

echo "▶ Installing dependencies…"
npm ci

echo "▶ Building…"
npm run build

echo "▶ Reloading PM2 process…"
# Reload only the existing web process by name — mirrors the manual deploy
# (`pm2 restart afnan-website`) and never spawns a duplicate server or touches
# the reconcile cron. `reload` is the graceful variant of restart.
pm2 reload afnan-website --update-env
pm2 save

echo "✅ Deploy complete."
