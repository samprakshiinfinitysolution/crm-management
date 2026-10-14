import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Only publicly reachable, indexable routes are listed.
 *
 * Every other route in the application is authentication-gated and is
 * redirected server-side by `src/proxy.ts`, so including them would submit
 * non-indexable URLs to search engines.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
