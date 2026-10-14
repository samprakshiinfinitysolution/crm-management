/**
 * Central SEO configuration.
 *
 * Provides the absolute site origin required by `metadataBase`, sitemap and
 * robots generation. Relative OG/canonical URLs cannot be resolved reliably by
 * crawlers or social scrapers, so every SEO surface derives from here.
 *
 * Override per environment with `NEXT_PUBLIC_SITE_URL`
 * (e.g. NEXT_PUBLIC_SITE_URL=https://crm.example.com).
 */

const FALLBACK_SITE_URL = "https://crm-management-hju6.onrender.com";

function resolveSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  const candidate = raw || FALLBACK_SITE_URL;
  return candidate.replace(/\/+$/, "");
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "LeadFlow CRM";

export const SITE_TITLE = "LeadFlow CRM | Lead Management & Sales Distribution";

export const SITE_DESCRIPTION =
  "Enterprise lead management, distribution engine and sales pipeline CRM. " +
  "Import, validate and distribute leads across your sales team with equal, " +
  "custom or manual allocation — backed by role-based access control and a " +
  "complete audit trail.";

/** Brand action colour (Tailwind blue-600), kept in sync with the UI. */
export const BRAND_COLOR = "#2563eb";

/**
 * Routes that must never be indexed. These are authentication-gated and are
 * redirected server-side by `src/proxy.ts`, so crawling them wastes budget and
 * produces "Page with redirect" reports.
 */
export const PRIVATE_PATH_PREFIXES = ["/dashboard", "/admin"] as const;
