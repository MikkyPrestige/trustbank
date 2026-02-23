/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [25, 50, 75, 80, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: `
    default-src 'self';
    connect-src 'self'
      https://nominatim.openstreetmap.org
      https://maps.googleapis.com
      https://translate.googleapis.com
      https://translate-pa.googleapis.com;
    script-src 'self' 'unsafe-eval' 'unsafe-inline'
      https://maps.googleapis.com
      https://translate.google.com
      https://translate.googleapis.com
      https://translate-pa.googleapis.com;
    style-src 'self' 'unsafe-inline'
      https://fonts.googleapis.com
      https://translate.googleapis.com
      https://www.gstatic.com;
    img-src 'self' blob: data:
      https://*.basemaps.cartocdn.com
      https://unpkg.com
      https://res.cloudinary.com
      https://ui-avatars.com
      https://nominatim.openstreetmap.org
      https://translate.google.com
      https://translate.googleapis.com
      https://www.google.com
      https://www.gstatic.com
      https://fonts.gstatic.com;
    font-src 'self' data: https://fonts.gstatic.com;
    frame-src 'self'
      https://www.google.com
      https://translate.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
