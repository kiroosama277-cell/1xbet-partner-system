import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "./db";
import { SESSION_COOKIE } from "./constants";

// HMAC secret key — use env var or fallback
const HMAC_SECRET = process.env.SESSION_HMAC_SECRET || "1xbet-affiliate-hmac-secret-2024-secure";

// Session duration: 24 hours
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// Generate a secure session token with HMAC signing and expiry
export function generateSessionToken(adminId: string): string {
  const timestamp = Date.now();
  const expiry = timestamp + SESSION_DURATION_MS;
  const random = Math.random().toString(36).slice(2);
  // Include expiry timestamp in payload
  const payload = `${adminId}:${timestamp}:${expiry}:${random}`;
  const hmac = createHmac("sha256", HMAC_SECRET).update(payload).digest("base64url");
  // Format: payload.hmac_signature
  const token = `${Buffer.from(payload).toString("base64url")}.${hmac}`;
  return token;
}

// Validate session token from cookie (verifies HMAC signature and expiry)
export async function validateSession(req: NextRequest): Promise<{
  valid: boolean;
  adminId?: string;
  userId?: string;
  username?: string;
}> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return { valid: false };

  try {
    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };

    const [encodedPayload, signature] = parts;
    const payload = Buffer.from(encodedPayload, "base64url").toString("utf-8");

    // Verify HMAC signature
    const expectedSig = createHmac("sha256", HMAC_SECRET).update(payload).digest("base64url");
    
    // Timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length) return { valid: false };
    if (!timingSafeEqual(sigBuf, expectedBuf)) return { valid: false };

    // Decode the payload to get adminId and expiry
    const [adminId, timestampStr, expiryStr] = payload.split(":");
    if (!adminId) return { valid: false };

    // Validate session expiry
    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      if (!isNaN(expiry) && Date.now() > expiry) {
        return { valid: false }; // Session expired
      }
    }

    // Check if admin still exists and is active
    const admin = await db.admin.findUnique({ where: { id: adminId } });
    if (!admin || !admin.isActive) return { valid: false };

    return {
      valid: true,
      adminId: admin.id,
      userId: admin.userId,
      username: admin.username,
    };
  } catch {
    return { valid: false };
  }
}

// Check if IP is allowed for a given admin
export function isIPAllowed(allowedIPs: string, clientIP: string): boolean {
  // "*" means any IP is allowed
  if (allowedIPs === "*" || allowedIPs === "") return true;

  const allowed = allowedIPs
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  return allowed.some((pattern) => {
    // Exact match
    if (pattern === clientIP) return true;

    // Wildcard match (e.g., 192.168.1.*)
    if (pattern.includes("*")) {
      const regex = new RegExp(
        "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
      );
      return regex.test(clientIP);
    }

    // CIDR-like prefix match (e.g., 192.168.1.)
    if (pattern.endsWith(".")) {
      return clientIP.startsWith(pattern);
    }

    return false;
  });
}

// Localhost IPs that are ALWAYS allowed (prevent lockout)
const LOCALHOST_IPS = ["127.0.0.1", "::1", "::ffff:127.0.0.1", "0:0:0:0:0:0:0:1", "localhost"];

// Check if IP is in global whitelist
export function isIPInGlobalWhitelist(clientIP: string, whitelistEntries: { ip: string }[]): boolean {
  if (whitelistEntries.length === 0) return true; // No whitelist = all allowed
  // Localhost is always allowed
  if (LOCALHOST_IPS.includes(clientIP)) return true;
  return whitelistEntries.some((entry) => {
    if (entry.ip === clientIP) return true;
    if (entry.ip.includes("*")) {
      const regex = new RegExp("^" + entry.ip.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$");
      return regex.test(clientIP);
    }
    if (entry.ip.endsWith(".")) {
      return clientIP.startsWith(entry.ip);
    }
    // IPv6 mapped IPv4
    if (clientIP.startsWith("::ffff:") && entry.ip === clientIP.replace("::ffff:", "")) return true;
    return false;
  });
}

// Get client IP from request
export function getClientIP(req: NextRequest): string {
  // Check various headers for the real IP (behind proxy/CDN)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP.trim();

  // Fallback
  return req.headers.get("x-client-ip") || "unknown";
}
