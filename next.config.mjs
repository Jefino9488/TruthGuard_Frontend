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
    NEXT_PUBLIC_MONGODB_URI: process.env.NEXT_PUBLIC_MONGODB_URI,
    NEXT_PUBLIC_MONGODB_DB: process.env.NEXT_PUBLIC_MONGODB_DB,
    NEXT_PUBLIC_GOOGLE_AI_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
    NEXT_PUBLIC_BACKEND_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
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