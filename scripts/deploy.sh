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
# startOrReload: starts the app on first deploy, graceful zero-downtime reload after.
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

echo "✅ Deploy complete."
