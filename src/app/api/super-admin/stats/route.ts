import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

// GET /api/super-admin/stats — superadmin-only dashboard stats
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  if (authResult.admin.role !== "superadmin") {
    return NextResponse.json({ error: "هذا الاجراء متاح للمشرف العام فقط" }, { status: 403 });
  }

  try {
    const [
      totalRegistrations,
      totalAdmins,
      activeAdmins,
      totalIPs,
      activeIPs,
    ] = await Promise.all([
      db.registration.count({ where: { deletedAt: null } }),
      db.admin.count(),
      db.admin.count({ where: { isActive: true } }),
      db.iPWhitelist.count(),
      db.iPWhitelist.count({ where: { isActive: true } }),
    ]);

    // Login attempt stats
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);

    const [
      recentAttempts,
      failedAttempts24h,
      successfulAttempts24h,
      lockedIPs,
    ] = await Promise.all([
      db.loginAttempt.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
      }),
      db.loginAttempt.count({ where: { success: false, createdAt: { gte: oneDayAgo } } }),
      db.loginAttempt.count({ where: { success: true, createdAt: { gte: oneDayAgo } } }),
      db.loginAttempt.groupBy({
        by: ['ip'],
        where: { success: false, createdAt: { gte: fifteenMinAgo } },
        _count: { ip: true },
        having: { _count: { ip: { _gte: 5 } } },
      }),
    ]);

    return NextResponse.json({
      overview: {
        totalRegistrations,
        totalAdmins,
        activeAdmins,
        totalIPs,
        activeIPs,
        failedAttempts24h,
        successfulAttempts24h,
        lockedIPCount: lockedIPs.length,
      },
      recentLoginAttempts: recentAttempts,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch superadmin stats" }, { status: 500 });
  }
}
