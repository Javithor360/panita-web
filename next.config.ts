import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        // YouTube video thumbnails (used when media_type = 'video')
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Increased to support large video file uploads (up to 500 MB).
      bodySizeLimit: '500mb',
    },
  },
};

export default nextConfig;

