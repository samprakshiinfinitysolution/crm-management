import type { Metadata } from "next";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

/**
 * Server Component layout for the authentication-gated admin workspace.
 *
 * The interactive shell lives in `AdminLayoutClient` (a Client Component)
 * because it depends on `usePathname`, `useState`, `useEffect` and the auth
 * guard. Metadata can only be exported from a Server Component, so the two
 * concerns are split.
 *
 * These routes are not intended to be indexed: unauthenticated visitors are
 * redirected server-side by `src/proxy.ts`, and every page requires admin
 * privileges before it renders meaningful content.
 */
export const metadata: Metadata = {
  title: "Admin Console",
  description:
    "Administrative workspace for user governance, lead inventory oversight, distribution control and system audit logs.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  alternates: {
    canonical: "/admin",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
