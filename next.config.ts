import type { NextConfig } from "next";

const remotePatterns: URL[] = [];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl) {
  try {
    remotePatterns.push(
      new URL("/storage/v1/object/public/media/**", supabaseUrl),
    );
  } catch {
    // Environment validation reports an invalid URL at runtime; keep builds safe.
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
