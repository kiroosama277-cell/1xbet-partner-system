import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getAuditLogs } from "@/lib/audit-logger";

// GET /api/super-admin/audit-log — fetch audit logs (superadmin only)
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  if (authResult.admin.role !== "superadmin") {
    return NextResponse.json({ error: "هذا الاجراء متاح للمشرف العام فقط" }, { status: 403 });
  }

  try {
    const url = req.nextUrl;
    const action = url.searchParams.get("action") || undefined;
    const targetType = url.searchParams.get("targetType") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const { logs, total } = await getAuditLogs({ action, targetType, limit, offset });

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
