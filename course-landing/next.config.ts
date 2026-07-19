import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the VPS. Run:
  //   PORT=3001 node .next/standalone/course-landing/server.js
  output: "standalone",

  // This app lives in a subfolder but imports shared code from the repo root
  // (@/models, @/lib). Point file tracing at the repo root so the standalone
  // bundle includes those files and the root node_modules they depend on.
  // Without this the production bundle crashes with "module not found".
  outputFileTracingRoot: path.join(__dirname, ".."),

  async headers() {
    return [
      {
        source: "/(.*)\\.(png|jpg|jpeg|gif|webp|avif|svg|ico|mp4|webm|woff|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
