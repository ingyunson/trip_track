/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // This is important for Chakra UI with Next.js
  transpilePackages: ['@chakra-ui/react']
};

module.exports = nextConfig;