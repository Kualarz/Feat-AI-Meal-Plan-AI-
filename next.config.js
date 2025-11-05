/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  productionBrowserSourceMaps: false, // Disable source maps in production
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression

  // Image optimization - restrict to trusted domains
  images: {
    remotePatterns: [
      // Spoonacular API
      {
        protocol: 'https',
        hostname: 'spoonacular.com',
        pathname: '/**',
      },
      // CDNs and common image services
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
    // Image optimization settings
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache
    formats: ['image/avif', 'image/webp'],
  },

  // Build configuration
  swcMinify: true, // Use SWC for faster minification

  // Environment variables
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

module.exports = nextConfig;
