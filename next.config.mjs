/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_BASE_URL}/api/:path*`,
      },
    ]
  },
  poweredByHeader: false,
  generateEtags: false,
}

export default nextConfig