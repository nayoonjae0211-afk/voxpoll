/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination:
          (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000") +
          "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
