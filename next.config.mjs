/** @type {import('next').NextConfig} */

// Check for required environment variables
const requiredEnv = [
  'NEXT_PUBLIC_MONGODB_URI',
  'NEXT_PUBLIC_MONGODB_DB',
  'NEXT_PUBLIC_GOOGLE_AI_API_KEY',
  'NEXT_PUBLIC_BACKEND_BASE_URL',
];

// Function to get environment variable with fallback
const getEnvVar = (key) => {
  const value = process.env[key];
  if (!value) {
    console.warn(`Warning: ${key} is not set. Using fallback value.`);
    // Provide fallback values for development
    switch (key) {
      case 'NEXT_PUBLIC_BACKEND_BASE_URL':
        return 'https://backend-377368788327.asia-south1.run.app';
      case 'NEXT_PUBLIC_MONGODB_URI':
        return 'mongodb+srv://jefino9488:Jefino1537@truthguardcluster.2wku5ai.mongodb.net/?retryWrites=true&w=majority&appName=TruthGuardCluster';
      case 'NEXT_PUBLIC_MONGODB_DB':
        return 'truthguard';
      default:
        return '';
    }
  }
  return value;
};

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
    NEXT_PUBLIC_MONGODB_URI: getEnvVar('NEXT_PUBLIC_MONGODB_URI'),
    NEXT_PUBLIC_MONGODB_DB: getEnvVar('NEXT_PUBLIC_MONGODB_DB'),
    NEXT_PUBLIC_GOOGLE_AI_API_KEY: getEnvVar('NEXT_PUBLIC_GOOGLE_AI_API_KEY'),
    NEXT_PUBLIC_BACKEND_BASE_URL: getEnvVar('NEXT_PUBLIC_BACKEND_BASE_URL'),
  },
  poweredByHeader: false,
  generateEtags: false,
}

export default nextConfig;
