import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native/server-only DB packages out of the bundler.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
};

export default nextConfig;
