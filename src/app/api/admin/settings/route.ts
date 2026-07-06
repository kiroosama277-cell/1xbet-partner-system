import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { logAdminAction } from "@/lib/activity-logger";
import { logAudit } from "@/lib/audit-logger";
import { getClientIP } from "@/lib/auth";

// GET /api/admin/settings
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const settings = await db.settings.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));
    return NextResponse.json(map);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// POST /api/admin/settings - upsert setting
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const body = await req.json();
    const { key, value } = body;
    if (!key || !value) {
      return NextResponse.json({ error: "Key and value required" }, { status: 400 });
    }

    const setting = await db.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // Log activity
    await logAdminAction({
      req,
      action: "setting_updated",
      details: `تم تحديث الإعداد: ${key} = ${value}`,
      admin: authResult.admin,
    });

    // Audit log
    const oldValue = (await db.settings.findUnique({ where: { key } }))?.value;
    await logAudit({
      action: "setting_update",
      targetType: "setting",
      targetId: key,
      targetName: key,
      oldValue: oldValue || null,
      newValue: value,
      adminId: authResult.admin.id,
      adminName: authResult.admin.username,
      adminUserId: authResult.admin.userId,
      ipAddress: getClientIP(req),
      details: `تحديث إعداد: ${key} من "${oldValue}" إلى "${value}"`,
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
