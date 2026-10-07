import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the project root (a stray package-lock.json exists in the user folder).
  turbopack: { root: path.resolve(__dirname) },

  // Let browsers and CDNs keep media for a day (and serve a stale copy while
  // refreshing for a week) so videos aren't re-downloaded on every visit.
  // When replacing a placeholder, give the new file a new name — see README.
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
