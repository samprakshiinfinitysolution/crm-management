import type { MetadataRoute } from "next";
import { SITE_URL, PRIVATE_PATH_PREFIXES } from "@/lib/seo";

/**
 * Blocks crawlers from the authentication-gated application surface so crawl
 * budget is spent only on the public marketing and login routes.
 *
 * Note: `disallow` prevents crawling, but does not by itself guarantee
 * de-indexation of already-discovered URLs. Protected route segments therefore
 * also emit `robots: { index: false }` metadata — see the segment layouts.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login"],
        disallow: [...PRIVATE_PATH_PREFIXES],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
