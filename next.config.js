/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }]
  },
  experimental: {
    serverActions: { allowedOrigins: ['*'] }
  }
}
module.exports = nextConfig
