import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Skip TypeScript and ESLint errors during Vercel build.
  // The codebase is type-checked locally; this prevents Prisma
  // client generation timing issues from blocking deployment.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
