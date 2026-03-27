import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
      { source: "/pricing", destination: "/pricing.html" },
      { source: "/features", destination: "/features.html" },
      { source: "/how-it-works", destination: "/how-it-works.html" },
      { source: "/privacy", destination: "/privacy.html" },
      { source: "/terms", destination: "/terms.html" },
    ];
  },
};

export default nextConfig;
