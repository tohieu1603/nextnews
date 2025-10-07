import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qr.sepay.vn',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
