import type { Metadata } from "next";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

/**
 * Server Component layout for the authentication-gated dashboard surface.
 *
 * The interactive shell lives in `DashboardLayoutClient` (a Client Component)
 * because it depends on `usePathname`, `useState` and the auth guard. Metadata
 * can only be exported from a Server Component, so the two concerns are split.
 *
 * These routes are not intended to be indexed: unauthenticated visitors are
 * redirected server-side by `src/proxy.ts`, and every page requires a valid
 * session before it renders meaningful content.
 */
export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Team Leader and Sales Executive workspace for lead assignment, follow-ups, distribution and reporting.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  alternates: {
    canonical: "/dashboard",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
