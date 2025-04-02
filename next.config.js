/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore type errors during build
  },
}

module.exports = nextConfig 