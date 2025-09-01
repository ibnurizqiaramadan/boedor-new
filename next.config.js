/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // Allow production builds to successfully complete even if
    // there are ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig
