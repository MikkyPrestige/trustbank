/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Allow these external image domains
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "example.com" },
      { protocol: "https", hostname: "avatar.vercel.sh" },
      { protocol: "https", hostname: "placehold.co" },
      // Add more here later (e.g. 'utfs.io' if you use UploadThing)
    ],
  },

  // 2. Keep your existing experimental flags
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
