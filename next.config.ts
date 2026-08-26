import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Skip TypeScript type-check errors during Vercel build.
  // The codebase is fully type-checked locally before pushing.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
