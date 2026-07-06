import { NextRequest, NextResponse } from "next/server";
import { getClientIP } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/auth/check-ip — Get client IP status for login form
// Only returns whether the IP is whitelisted, not the actual IP address
export async function GET(req: NextRequest) {
  const clientIP = getClientIP(req);

  const whitelistEntries = await db.iPWhitelist.findMany({
    where: { isActive: true },
  });

  const LOCALHOST_IPS = ["127.0.0.1", "::1", "::ffff:127.0.0.1", "0:0:0:0:0:0:0:1", "localhost"];
  const isLocalhost = LOCALHOST_IPS.includes(clientIP);

  let isWhitelisted = true;
  if (whitelistEntries.length > 0 && !isLocalhost) {
    isWhitelisted = whitelistEntries.some((entry) => {
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
      if (clientIP.startsWith("::ffff:") && entry.ip === clientIP.replace("::ffff:", "")) return true;
      return false;
    });
  }

  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
  const recentFailedAttempts = await db.loginAttempt.count({
    where: { ip: clientIP, success: false, createdAt: { gte: fifteenMinAgo } },
  });

  return NextResponse.json({
    isWhitelisted,
    whitelistActive: whitelistEntries.length > 0,
    rateLimited: recentFailedAttempts >= 5,
    failedAttempts: recentFailedAttempts,
  });
}
