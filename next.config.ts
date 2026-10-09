import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones test the dev server over the LAN IP (otherwise JS is blocked — buttons/menu don't work).
  // Dev mode only; doesn't affect production builds.
  allowedDevOrigins: ["10.211.40.106", "192.168.*.*", "10.*.*.*"],
  // dev "N" indicator off — it covers the mobile tab bar and cart drawer close button (dev mode only)
  devIndicators: false,
  experimental: {
    agentFeedback: true,
    // product photo uploads (already resized in the browser to well under 1 MB) + multipart overhead
    serverActions: { bodySizeLimit: "2mb" },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
