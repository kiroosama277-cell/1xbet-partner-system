import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

// GET /api/admin/login-attempts — list login attempts (superadmin only)
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  if (authResult.admin.role !== "superadmin") {
    return NextResponse.json({ error: "هذا الاجراء متاح للمشرف العام فقط" }, { status: 403 });
  }
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
    const attempts = await db.loginAttempt.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json(attempts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch login attempts" }, { status: 500 });
  }
}
