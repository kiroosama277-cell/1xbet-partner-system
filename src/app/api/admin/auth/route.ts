import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  generateSessionToken,
  isIPAllowed,
  getClientIP,
} from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";

// POST /api/admin/auth — Login with userId + accessCode
export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req);

  try {
    // --- STEP 0: Check Rate Limiting ---
    // Check if this IP has 5+ failed attempts in the last 15 minutes
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentFailedAttempts = await db.loginAttempt.count({
      where: {
        ip: clientIP,
        success: false,
        createdAt: { gte: fifteenMinAgo },
      },
    });

    if (recentFailedAttempts >= 5) {
      return NextResponse.json(
        { error: "تم تجاوز عدد المحاولات المسموحة. حاول مرة أخرى بعد 30 دقيقة", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { userId, accessCode } = body;

    if (!userId || !accessCode) {
      return NextResponse.json(
        { error: "رقم التعريف وكود الدخول مطلوبان" },
        { status: 400 }
      );
    }

    // --- STEP 1: Check Global IP Whitelist ---
    // If there are active IPs in the whitelist, the client IP must match one of them
    const whitelistEntries = await db.iPWhitelist.findMany({
      where: { isActive: true },
    });

    // Localhost IPs are ALWAYS allowed (prevent lockout)
    const LOCALHOST_IPS = ["127.0.0.1", "::1", "::ffff:127.0.0.1", "0:0:0:0:0:0:0:1", "localhost"];
    const isLocalhost = LOCALHOST_IPS.includes(clientIP);

    if (whitelistEntries.length > 0 && !isLocalhost) {
      const isGloballyAllowed = whitelistEntries.some((entry) => {
        // Exact match
        if (entry.ip === clientIP) return true;
        // Wildcard match (e.g., 192.168.1.*)
        if (entry.ip.includes("*")) {
          const regex = new RegExp(
            "^" + entry.ip.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
          );
          return regex.test(clientIP);
        }
        // CIDR-like prefix match (e.g., 192.168.1.)
        if (entry.ip.endsWith(".")) {
          return clientIP.startsWith(entry.ip);
        }
        // IPv6 mapped IPv4 (e.g., ::ffff:192.168.1.1)
        if (clientIP.startsWith("::ffff:") && entry.ip === clientIP.replace("::ffff:", "")) return true;
        return false;
      });

      if (!isGloballyAllowed) {
        // Log the failed attempt
        await db.loginAttempt.create({
          data: {
            userId,
            ip: clientIP,
            success: false,
            reason: "IP غير موجود في القائمة البيضاء",
          },
        });
        return NextResponse.json(
          { error: "عنوان IP غير مصرح به. يجب إضافته للقائمة البيضاء أولاً", code: "IP_NOT_WHITELISTED" },
          { status: 403 }
        );
      }
    }

    // --- STEP 2: Find admin by userId ---
    const admin = await db.admin.findUnique({ where: { userId } });

    // Use generic error message to avoid information leakage
    const GENERIC_ERROR = "بيانات الدخول غير صحيحة";

    if (!admin) {
      // Log the failed attempt
      await db.loginAttempt.create({
        data: {
          userId,
          ip: clientIP,
          success: false,
          reason: "رقم التعريف غير موجود أو كود الدخول غير صحيح",
        },
      });
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    // --- STEP 3: Check if account is active ---
    if (!admin.isActive) {
      await db.loginAttempt.create({
        data: {
          userId,
          ip: clientIP,
          success: false,
          reason: "الحساب معطل",
        },
      });
      return NextResponse.json(
        { error: "هذا الحساب معطل، تواصل مع المشرف" },
        { status: 403 }
      );
    }

    // --- STEP 4: Check per-user IP restriction ---
    if (!isIPAllowed(admin.allowedIPs, clientIP)) {
      await db.loginAttempt.create({
        data: {
          userId,
          ip: clientIP,
          success: false,
          reason: "IP غير مصرح به لهذا الحساب",
        },
      });
      return NextResponse.json(
        { error: "عنوان IP غير مصرح به لهذا الحساب", code: "IP_NOT_ALLOWED" },
        { status: 403 }
      );
    }

    // --- STEP 5: Verify access code using bcrypt.compare() ---
    const isCodeValid = await bcrypt.compare(accessCode, admin.accessCode);
    if (!isCodeValid) {
      await db.loginAttempt.create({
        data: {
          userId,
          ip: clientIP,
          success: false,
          reason: "كود الدخول غير صحيح",
        },
      });
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    // --- STEP 6: Successful login ---
    await db.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date(), lastLoginIP: clientIP },
    });

    await db.loginAttempt.create({
      data: {
        userId,
        ip: clientIP,
        success: true,
        reason: null,
      },
    });

    // Log successful login to activity log
    try {
      await db.activityLog.create({
        data: {
          action: "admin_login",
          details: `تسجيل دخول ناجح — المستخدم: ${admin.username} (ID: ${admin.userId})`,
          adminId: admin.id,
          adminName: admin.username,
          adminUserId: admin.userId,
          ipAddress: clientIP,
        },
      });
    } catch {}

    // Generate session token (now with HMAC and expiry)
    const token = generateSessionToken(admin.id);

    const response = NextResponse.json({
      success: true,
      userId: admin.userId,
      username: admin.username,
      role: admin.role,
    });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "حدث خطأ في تسجيل الدخول" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/auth — Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

// GET /api/admin/auth/check-ip — Check client IP
export async function GET(req: NextRequest) {
  const clientIP = getClientIP(req);

  // Also check if this IP is whitelisted
  const whitelistEntries = await db.iPWhitelist.findMany({
    where: { isActive: true },
  });

  // Localhost IPs are ALWAYS allowed (prevent lockout)
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
      // IPv6 mapped IPv4
      if (clientIP.startsWith("::ffff:") && entry.ip === clientIP.replace("::ffff:", "")) return true;
      return false;
    });
  }

  // Also check rate limiting status
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
  const recentFailedAttempts = await db.loginAttempt.count({
    where: {
      ip: clientIP,
      success: false,
      createdAt: { gte: fifteenMinAgo },
    },
  });

  return NextResponse.json({ 
    ip: clientIP, 
    isWhitelisted, 
    whitelistActive: whitelistEntries.length > 0,
    rateLimited: recentFailedAttempts >= 5,
    failedAttempts: recentFailedAttempts,
  });
}
