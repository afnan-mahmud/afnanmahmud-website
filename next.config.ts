import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained server bundle in `.next/standalone` for the VPS,
  // so production doesn't need the full node_modules tree at runtime
  // (smaller footprint, faster boot). Run with: node .next/standalone/server.js
  output: 'standalone',

  // The motion-graphics lesson pages are plain .html files read from disk at
  // request time (see app/ai-for-developers/lesson/[...slug]/route.ts). Nothing
  // imports them, so tracing would leave them out of the standalone bundle.
  outputFileTracingIncludes: {
    '/ai-for-developers/lesson/\\[\\.\\.\\.slug\\]': [
      './app/ai-for-developers/lesson/**/*.html',
    ],
  },

  // Long-lived cache for static media in /public. These files are
  // content-stable (renamed when they change), so a 1-year immutable cache
  // keeps repeat visits from re-downloading them. Fixes Lighthouse's
  // "Use efficient cache lifetimes" finding.
  async headers() {
    return [
      {
        source: '/(.*)\\.(png|jpg|jpeg|gif|webp|avif|svg|ico|mp4|webm|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
