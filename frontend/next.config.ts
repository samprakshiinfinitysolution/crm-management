import type { NextConfig } from "next";

function getSafeBackendUrl(): string {
  // Support internal Docker/VPC backend URL (e.g. http://backend:5000) or standard BACKEND_URL
  let raw = (
    process.env.INTERNAL_BACKEND_URL ||
    process.env.BACKEND_URL ||
    ""
  ).trim();

  // Remove trailing /api and trailing slashes
  raw = raw.replace(/\/api\/?$/, "").replace(/\/+$/, "");

  // Fallback for production or local builds
  if (!raw || raw === "undefined" || raw === "null") {
    return process.env.NODE_ENV === "production"
      ? "https://crm-management-hju6.onrender.com"
      : "http://localhost:5000";
  }

  // Ensure protocol exists
  if (
    !raw.startsWith("http://") &&
    !raw.startsWith("https://") &&
    !raw.startsWith("/")
  ) {
    raw = `https://${raw}`;
  }

  return raw;
}

const backendUrl = getSafeBackendUrl();

const nextConfig: NextConfig = {
  // Hide Next.js fingerprint from response headers
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/socket.io",
        destination: `${backendUrl}/socket.io`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${backendUrl}/socket.io/:path*`,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/teamleader",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/teamleader/:path*",
        destination: "/dashboard/:path*",
        permanent: true,
      },
      {
        source: "/team_leader",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/team_leader/:path*",
        destination: "/dashboard/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
