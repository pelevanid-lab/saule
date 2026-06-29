import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/life',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/life',
        basePath: false,
        permanent: false,
      },
    ];
  },
  /* config options here */
};

// Trigger dev server reload to clear static route cache
export default nextConfig;

