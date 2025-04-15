/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'l4-l7-fractal-self-awareness-intelligence-router.vercel.app'
      ],
    },
  },
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'vercel.com'
    ],
  },
  // Disable linting during build - we run it separately
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable type checking during build - we run it separately
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig 