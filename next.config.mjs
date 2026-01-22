/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "21mb",
    },
  },
};

export default nextConfig;
