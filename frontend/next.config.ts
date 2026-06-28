import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
} as any; // The 'as any' bypasses the strict type checking for this object

export default nextConfig;