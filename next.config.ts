import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/reviews/ai-media-machine', destination: '/reviews/bluefx', permanent: true },
      { source: '/ai-media-machine', destination: '/reviews/bluefx', permanent: true },
      { source: '/bluefx', destination: '/reviews/bluefx', permanent: true },
      { source: '/go/ai-media-machine', destination: '/go/bluefx', permanent: true },
      { source: '/reviews/adcreative', destination: '/categories/marketing', permanent: true },
      { source: '/adcreative', destination: '/categories/marketing', permanent: true },
      { source: '/go/adcreative', destination: '/categories/marketing', permanent: true },
    ];
  },
};

export default nextConfig;
