import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app serves raw HTML — no image optimization needed
  images: { unoptimized: true },
};

export default nextConfig;
