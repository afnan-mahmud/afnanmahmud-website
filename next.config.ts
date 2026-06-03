import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained server bundle in `.next/standalone` for the VPS,
  // so production doesn't need the full node_modules tree at runtime
  // (smaller footprint, faster boot). Run with: node .next/standalone/server.js
  output: 'standalone',
};

export default nextConfig;
