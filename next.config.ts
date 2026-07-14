import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  // Same-origin proxy: browser → :3000/api/v1 → :8000/api/v1
  // Avoids CORS / Docker localhost "Failed to fetch" issues in local dev.
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
