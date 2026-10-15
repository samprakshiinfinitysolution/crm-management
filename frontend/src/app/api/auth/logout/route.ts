import { NextResponse, type NextRequest } from 'next/server';

/**
 * Server-side logout route.
 *
 * Browser requests reach this same-origin `/api/auth/logout` path, which — as a
 * Next.js filesystem route — takes precedence over the `/api/:path*` rewrite to
 * the backend. To ensure the backend session is actually invalidated (JWT
 * blacklist + Redis session removal + LOGOUT audit), this handler forwards the
 * request to the real backend `/api/auth/logout` endpoint with the incoming
 * auth cookie, relays any `Set-Cookie` the backend returns, and additionally
 * clears the auth cookie locally as a fallback (client JS cannot delete
 * httpOnly cookies, but this server route can).
 *
 * It is intentionally resilient: if the backend is unreachable, cookies are
 * still cleared and the response reports `backendInvalidated: false` so the
 * caller can be honest about server-side revocation.
 */

/** Resolve the backend origin from validated env (mirrors next.config.ts). */
function getBackendOrigin(): string {
  let raw = (
    process.env.INTERNAL_BACKEND_URL ||
    process.env.BACKEND_URL ||
    ''
  ).trim();
  raw = raw.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  if (!raw || raw === 'undefined' || raw === 'null') {
    return process.env.NODE_ENV === 'production'
      ? 'https://crm-management-hju6.onrender.com'
      : 'http://localhost:5000';
  }
  if (!/^https?:\/\//.test(raw)) {
    raw = `https://${raw}`;
  }
  return raw;
}

/**
 * Resolve the auth cookie name. The backend is authoritative for the name it
 * sets (`AUTH_COOKIE_NAME || TOKEN_KEY || CRM_Management`); mirror that here so
 * the cookie cleared locally matches the one the backend issued.
 */
function getAuthCookieName(): string {
  return (
    process.env.AUTH_COOKIE_NAME ||
    process.env.NEXT_PUBLIC_TOKEN_KEY ||
    process.env.TOKEN_KEY ||
    'CRM_Management'
  );
}

/** Cookie names historically used by the app; all are cleared defensively. */
function getAllCookieNames(): string[] {
  return Array.from(
    new Set([getAuthCookieName(), 'CRM_Management', 'token', 'refreshToken', 'session']),
  );
}

export async function POST(request: NextRequest) {
  const backendOrigin = getBackendOrigin();
  const forwardedCookie = request.headers.get('cookie') || '';

  let backendInvalidated = false;

  // 1. Ask the backend to invalidate the session + blacklist the token.
  try {
    const upstream = await fetch(`${backendOrigin}/api/auth/logout`, {
      method: 'POST',
      headers: forwardedCookie ? { cookie: forwardedCookie } : {},
      // Do not auto-follow redirects; we only care about the status.
      redirect: 'manual',
    });
    backendInvalidated = upstream.ok;
  } catch (error) {
    // Backend unreachable — proceed with local cookie clearing anyway.
    console.warn('[logout] Backend logout request failed:', error);
  }

  // 2. Build the response, clearing the auth cookie(s) locally as a fallback.
  const response = NextResponse.json(
    {
      success: true,
      message: 'Logged out successfully',
      backendInvalidated,
    },
    { status: 200 },
  );

  const expired = { path: '/', expires: new Date(0), maxAge: 0 };
  for (const name of getAllCookieNames()) {
    response.cookies.set(name, '', expired);
  }

  return response;
}
