import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      { source: "/membership", destination: "/pricing", permanent: true },
      { source: "/membership/:path*", destination: "/pricing", permanent: true },
    ];
  },
};

export default nextConfig;
