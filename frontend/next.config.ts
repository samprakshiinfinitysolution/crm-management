import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

function getSafeBackendUrl(): string {
  let raw = (
    process.env.INTERNAL_BACKEND_URL ||
    process.env.BACKEND_URL ||
    ""
  ).trim();

  // Remove trailing /api and trailing slashes
  raw = raw.replace(/\/api\/?$/, "").replace(/\/+$/, "");

  // Fallback for production or local builds
  if (!raw || raw === "undefined" || raw === "null") {
    const isCloudHost =
      Boolean(process.env.VERCEL) || Boolean(process.env.RENDER);
    return isCloudHost
      ? "https://crm-management-hju6.onrender.com"
      : "http://127.0.0.1:5000";
  }

  // Ensure protocol exists
  if (
    !raw.startsWith("http://") &&
    !raw.startsWith("https://") &&
    !raw.startsWith("/")
  ) {
    raw = `https://${raw}`;
  }

  // On local Windows dev, prefer 127.0.0.1 over localhost to avoid IPv6 (::1) fallback delays
  if (raw.includes("localhost:5000")) {
    raw = raw.replace("localhost:5000", "127.0.0.1:5000");
  }

  return raw;
}

const backendUrl = getSafeBackendUrl();

const withSerwist = withSerwistInit({
  // Path to your custom service worker file (src/app/sw.ts)
  swSrc: "src/app/sw.ts",
  // Path where the built service worker will be served from public directory
  swDest: "public/sw.js",
  // Disable Serwist during development to avoid Turbopack conflicts and caching disruptions
  disable: process.env.NODE_ENV !== "production",
  // Exclude fonts and sourcemaps from precache manifest (fonts are handled dynamically via runtime cache)
  exclude: [/\.map$/, /\.(?:woff|woff2|eot|ttf|otf)$/, /^manifest/],
});

const nextConfig: NextConfig = {
  // Hide Next.js fingerprint from response headers
  turbopack: {},
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@tanstack/react-query",
      "@base-ui/react",
      "sonner",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000, // Cache optimized images for 30 days
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
      // 1-year immutable caching for static images in public/
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
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

export default withSerwist(nextConfig);
