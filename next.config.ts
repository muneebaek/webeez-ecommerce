import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phone-il LAN IP vazhi dev server test cheyyaan (illenkil JS block aakum — buttons/menu work aakilla).
  // Dev mode-il mathram; production build-ine bhaadhikkilla.
  allowedDevOrigins: ["10.211.40.106", "192.168.*.*", "10.*.*.*"],
  // dev "N" indicator mobile tab bar-inte mukalil varaathirikkaan
  devIndicators: { position: "top-right" },
  experimental: {
    agentFeedback: true,
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
