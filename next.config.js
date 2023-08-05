/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
  output: process.env.NODE_ENV === 'development' ? 'standalone' : 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
