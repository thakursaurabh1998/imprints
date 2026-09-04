/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.NODE_ENV === 'development' ? 'standalone' : 'export',
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: process.env.NEXT_DEV_ALLOWED_ORIGIN
    ? [process.env.NEXT_DEV_ALLOWED_ORIGIN]
    : [],
};

module.exports = nextConfig;
