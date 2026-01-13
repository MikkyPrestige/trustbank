/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Allow these external image domains
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "example.com" },
      { protocol: "https", hostname: "avatar.vercel.sh" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },

  // 2. Keep your existing experimental flags
  experimental: {
    // reactCompiler: true,
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
