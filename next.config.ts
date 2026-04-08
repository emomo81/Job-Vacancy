import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Spline & Unicorn Studio assets
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "prod.spline.design" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
    ],
  },
  // Required for Render (standalone output bundles everything needed)
  output: "standalone",
};

export default nextConfig;
