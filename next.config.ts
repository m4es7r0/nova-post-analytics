import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure server-only packages are not bundled into client
  serverExternalPackages: ["@neondatabase/serverless"],
};

export default nextConfig;
