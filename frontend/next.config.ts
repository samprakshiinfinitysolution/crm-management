import type { NextConfig } from "next";

function getSafeBackendUrl(): string {
  let raw = (process.env.BACKEND_URL || "").trim();

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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
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
