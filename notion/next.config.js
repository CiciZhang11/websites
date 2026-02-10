/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable ESLint during build on platforms like Vercel where dev-time lint
  // dependencies or configs may not be available.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
