import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Environment variables are loaded from web/.env automatically by Next.js
  // NEXT_PUBLIC_* vars are available client-side
  output: "standalone", // Optimized for Docker/Railway deployment

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // Performance
  reactStrictMode: false,
  poweredByHeader: false, // Don't expose Next.js version
};

export default nextConfig;
