import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "@/lib/jwt";
import { UserRole } from "@/types/api.types";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenKey = process.env.AUTH_COOKIE_NAME || "CRM_Management";
  const token =
    request.cookies.get(tokenKey)?.value ||
    request.cookies.get("CRM_Management")?.value ||
    request.cookies.get("refreshToken")?.value;

  const decoded = token ? decodeJwt(token) : null;
  const isDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isLegacyRoute =
    pathname.startsWith("/team_leader") || pathname.startsWith("/sales_executive");

  // Legacy route redirection
  if (isLegacyRoute) {
    if (!decoded) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (decoded.role === UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 1. Public Home Page
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 2. Login Page: if already authenticated, route based on role
  if (pathname === "/login") {
    if (decoded) {
      if (decoded.role === UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected /admin routes (Admin only)
  if (isAdminRoute) {
    if (!decoded) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      if (token) {
        response.cookies.delete(tokenKey);
      }
      return response;
    }

    if (decoded.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // 4. Protected /dashboard routes (TL & Sales Executive only)
  if (isDashboardRoute) {
    if (!decoded) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      // Only purge cookies if a token cookie was provided but was expired/corrupt
      if (token) {
        response.cookies.delete(tokenKey);
      }
      return response;
    }

    // Admins operate in the dedicated /admin workspace
    if (decoded.role === UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const isTeamLeader = decoded.role === UserRole.TEAM_LEADER;

    // Team Leader Only Routes
    const tlOnlyRoutes = [
      "/dashboard/leads/create",
      "/dashboard/distributions",
      "/dashboard/users",
      "/dashboard/reports",
      "/dashboard/imports",
      "/dashboard/audit-logs",
    ];

    const isTLOnly = tlOnlyRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (isTLOnly && !isTeamLeader) {
      // Sales executive attempting to access TL-only section
      return NextResponse.redirect(new URL("/dashboard/my-leads", request.url));
    }

    // Sales Executive Only Routes
    if (pathname.startsWith("/dashboard/my-leads") && isTeamLeader) {
      return NextResponse.redirect(new URL("/dashboard/leads", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/admin/:path*",
    "/team_leader/:path*",
    "/sales_executive/:path*",
  ],
};
