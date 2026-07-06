import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { logAudit } from "@/lib/audit-logger";
import { getClientIP } from "@/lib/auth";

// GET /api/super-admin/login-attempts — fetch all login attempts
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  if (authResult.admin.role !== "superadmin") {
    return NextResponse.json({ error: "هذا الاجراء متاح للمشرف العام فقط" }, { status: 403 });
  }

  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

    const [attempts, total] = await Promise.all([
      db.loginAttempt.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.loginAttempt.count(),
    ]);

    // Compute who logged in and who didn't
    const uniqueUserIds = [...new Set(attempts.map(a => a.userId))];
    const loginStatusMap: Record<string, { success: boolean; lastAttempt: Date; ip: string }> = {};
    
    for (const uid of uniqueUserIds) {
      const userAttempts = attempts.filter(a => a.userId === uid);
      const lastSuccess = userAttempts.find(a => a.success);
      loginStatusMap[uid] = {
        success: !!lastSuccess,
        lastAttempt: new Date(userAttempts[0].createdAt),
        ip: userAttempts[0].ip,
      };
    }

    return NextResponse.json({ attempts, total, loginStatusMap });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch login attempts" }, { status: 500 });
  }
}

// DELETE /api/super-admin/login-attempts — clear login attempts log
export async function DELETE(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  if (authResult.admin.role !== "superadmin") {
    return NextResponse.json({ error: "هذا الاجراء متاح للمشرف العام فقط" }, { status: 403 });
  }

  try {
    const count = await db.loginAttempt.count();
    await db.loginAttempt.deleteMany({});

    // Audit log
    const clientIP = getClientIP(req);
    await logAudit({
      action: "login_attempts_clear",
      targetType: "login_attempt",
      oldValue: `${count} records`,
      adminId: authResult.admin.id,
      adminName: authResult.admin.username,
      adminUserId: authResult.admin.userId,
      ipAddress: clientIP,
      details: `مسح سجل محاولات الدخول (${count} سجل)`,
    });

    return NextResponse.json({ success: true, deletedCount: count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to clear login attempts" }, { status: 500 });
  }
}
