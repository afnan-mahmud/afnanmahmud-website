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

# ---------------------------------------------------------------------------
# course.afnanmahmud.com — the subdomain landing/purchase app (course-landing/).
# Shares this repo and the root node_modules; runs as its own PM2 process on
# :3001 behind its own nginx server block.
# ---------------------------------------------------------------------------
if [ -d course-landing ]; then
  echo "▶ Building course subdomain…"
  (
    cd course-landing

    # Next reads .env relative to the build cwd (here: course-landing/), so the
    # repo-root env must be present BEFORE building — NEXT_PUBLIC_* values (Meta
    # pixel id, TikTok pixel id) are inlined at build time, not read at runtime.
    for f in .env .env.local .env.production; do
      if [ -f "../$f" ]; then
        cp "../$f" "$f"
      fi
    done

    npm run build

    # `output: standalone` does NOT bundle static assets or /public — without
    # this copy every JS/CSS chunk 404s and the page renders blank.
    STANDALONE=.next/standalone/course-landing
    rm -rf "$STANDALONE/.next/static"
    cp -r .next/static "$STANDALONE/.next/static"
    if [ -d public ]; then
      rm -rf "$STANDALONE/public"
      cp -r public "$STANDALONE/public"
    fi

    # The standalone server chdir's to its own directory, so it looks for .env
    # files there. Hand it the repo-root env (MONGODB_URI, EPS_*, META_*, …).
    # NEXTAUTH_URL is deliberately NOT taken from here: PM2's ecosystem env sets
    # it to the subdomain URL, and values already in process.env win over .env
    # files — which is what keeps EPS redirects on course.afnanmahmud.com.
    for f in .env .env.local .env.production; do
      if [ -f "../$f" ]; then
        cp "../$f" "$STANDALONE/$f"
      fi
    done
  )

  echo "▶ Reloading course-landing PM2 process…"
  if pm2 describe course-landing >/dev/null 2>&1; then
    pm2 reload course-landing --update-env
  else
    # First deploy on this server — start it from the ecosystem config.
    pm2 start course-landing/ecosystem.config.js
  fi
  pm2 save
fi

echo "✅ Deploy complete."
