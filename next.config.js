/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',
  optimizeFonts: false,
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      'images.pexels.com',
      'jetszeocssxacafrkmln.supabase.co'
    ],
    minimumCacheTTL: 31536000,
    unoptimized: false,
    dangerouslyAllowSVG: true,
  },
};

module.exports = nextConfig;