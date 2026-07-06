import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { SESSION_COOKIE } from "@/lib/constants";

const HMAC_SECRET = process.env.SESSION_HMAC_SECRET || "1xbet-affiliate-hmac-secret-2024-secure";

// Security headers to add to all admin/super-admin responses
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; form-action 'self';"
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isSuperAdminPage = pathname === "/super-admin" || pathname.startsWith("/super-admin/");
  const isAdminAPI = pathname.startsWith("/api/admin");
  const isSuperAdminAPI = pathname.startsWith("/api/super-admin");

  // Non-admin routes: pass through without any checks
  if (!isAdminPage && !isSuperAdminPage && !isAdminAPI && !isSuperAdminAPI) {
    return NextResponse.next();
  }

  // Allow auth endpoints through (login/IP check) but still add security headers
  if (pathname === "/api/admin/auth" || pathname === "/api/admin/auth/check-ip") {
    return addSecurityHeaders(NextResponse.next());
  }

  // Allow admin/super-admin pages to load (client-side auth check)
  // Only API routes need server-side session validation
  if ((isAdminPage || isSuperAdminPage) && !isAdminAPI && !isSuperAdminAPI) {
    return addSecurityHeaders(NextResponse.next());
  }

  // For API routes: check session cookie with FULL HMAC verification
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return addSecurityHeaders(
      NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 })
    );
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      return addSecurityHeaders(
        NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 })
      );
    }

    const [encodedPayload, signature] = parts;
    const payload = Buffer.from(encodedPayload, "base64url").toString("utf-8");

    // Verify HMAC signature (timing-safe to prevent timing attacks)
    const expectedSig = createHmac("sha256", HMAC_SECRET).update(payload).digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length) {
      return addSecurityHeaders(
        NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 })
      );
    }
    if (!timingSafeEqual(sigBuf, expectedBuf)) {
      return addSecurityHeaders(
        NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 })
      );
    }

    // Decode payload and check expiry
    const [adminId, timestampStr, expiryStr] = payload.split(":");
    if (!adminId) {
      return addSecurityHeaders(
        NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 })
      );
    }

    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      if (!isNaN(expiry) && Date.now() > expiry) {
        return addSecurityHeaders(
          NextResponse.json({ error: "انتهت صلاحية الجلسة" }, { status: 401 })
        );
      }
    }

    // Attach admin info to headers for downstream use
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-admin-id", adminId);

    return addSecurityHeaders(
      NextResponse.next({
        request: { headers: requestHeaders },
      })
    );
  } catch {
    return addSecurityHeaders(
      NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 })
    );
  }
}

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*", "/api/admin/:path*", "/api/super-admin/:path*"],
};
