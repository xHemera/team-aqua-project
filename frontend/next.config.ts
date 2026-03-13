import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "archives.bulbagarden.net",
      },
    ],
  },
};

export default nextConfig;
