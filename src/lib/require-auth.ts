import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "./db";
import { isIPAllowed, getClientIP } from "./auth";
import { SESSION_COOKIE } from "./constants";

// HMAC secret — must match auth.ts
const HMAC_SECRET = process.env.SESSION_HMAC_SECRET || "1xbet-affiliate-hmac-secret-2024-secure";

// Session duration: 24 hours (must match auth.ts)
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// Validate admin session from API route (with full DB + IP check + HMAC + global whitelist + rate limit + expiry)
export async function requireAuth(req: NextRequest): Promise<{
  authorized: true;
  admin: {
    id: string;
    userId: string;
    username: string;
    allowedIPs: string;
    isActive: boolean;
    role: string;
  };
} | { authorized: false; response: NextResponse }> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 }),
    };
  }

  try {
    // --- HMAC Verification ---
    const parts = token.split(".");
    if (parts.length !== 2) {
      return {
        authorized: false,
        response: NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 }),
      };
    }

    const [encodedPayload, signature] = parts;
    const payload = Buffer.from(encodedPayload, "base64url").toString("utf-8");

    // Verify HMAC signature
    const expectedSig = createHmac("sha256", HMAC_SECRET).update(payload).digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length) {
      return {
        authorized: false,
        response: NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 }),
      };
    }
    if (!timingSafeEqual(sigBuf, expectedBuf)) {
      return {
        authorized: false,
        response: NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 }),
      };
    }

    // Decode payload
    const [adminId, timestampStr, expiryStr] = payload.split(":");
    if (!adminId) {
      return {
        authorized: false,
        response: NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 }),
      };
    }

    // --- Session Expiry Validation ---
    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      if (!isNaN(expiry) && Date.now() > expiry) {
        return {
          authorized: false,
          response: NextResponse.json({ error: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى" }, { status: 401 }),
        };
      }
    }

    // --- Rate Limiting Check ---
    const clientIP = getClientIP(req);
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentFailedAttempts = await db.loginAttempt.count({
      where: {
        ip: clientIP,
        success: false,
        createdAt: { gte: fifteenMinAgo },
      },
    });

    if (recentFailedAttempts >= 5) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "تم تجاوز عدد المحاولات المسموحة. حاول مرة أخرى بعد 30 دقيقة" },
          { status: 429 }
        ),
      };
    }

    // --- Look up admin in DB ---
    const admin = await db.admin.findUnique({ where: { id: adminId } });
    if (!admin || !admin.isActive) {
      return {
        authorized: false,
        response: NextResponse.json({ error: "الحساب معطل أو غير موجود" }, { status: 403 }),
      };
    }

    // --- Per-user IP check ---
    if (!isIPAllowed(admin.allowedIPs, clientIP)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "عنوان IP غير مصرح به لهذا الحساب" },
          { status: 403 }
        ),
      };
    }

    // --- Global IP Whitelist Check ---
    const whitelistEntries = await db.iPWhitelist.findMany({
      where: { isActive: true },
    });

    // Localhost IPs are ALWAYS allowed (prevent lockout)
    const LOCALHOST_IPS = ["127.0.0.1", "::1", "::ffff:127.0.0.1", "0:0:0:0:0:0:0:1", "localhost"];
    const isLocalhost = LOCALHOST_IPS.includes(clientIP);

    if (whitelistEntries.length > 0 && !isLocalhost) {
      const isGloballyAllowed = whitelistEntries.some((entry) => {
        if (entry.ip === clientIP) return true;
        if (entry.ip.includes("*")) {
          const regex = new RegExp(
            "^" + entry.ip.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
          );
          return regex.test(clientIP);
        }
        if (entry.ip.endsWith(".")) {
          return clientIP.startsWith(entry.ip);
        }
        // IPv6 mapped IPv4
        if (clientIP.startsWith("::ffff:") && entry.ip === clientIP.replace("::ffff:", "")) return true;
        return false;
      });

      if (!isGloballyAllowed) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: "عنوان IP غير مصرح به في القائمة البيضاء" },
            { status: 403 }
          ),
        };
      }
    }

    return {
      authorized: true,
      admin: {
        id: admin.id,
        userId: admin.userId,
        username: admin.username,
        allowedIPs: admin.allowedIPs,
        isActive: admin.isActive,
        role: admin.role,
      },
    };
  } catch {
    return {
      authorized: false,
      response: NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 }),
    };
  }
}
