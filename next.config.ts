import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx"],
  async rewrites() {
    return [{ source: "/img/:path*", destination: "/legacy-assets/img/:path*" }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 80, 90],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;