import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

// GET /api/admin/activities
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

    const [activities, total] = await Promise.all([
      db.activityLog.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          salesRef: { select: { id: true, code: true, name: true } },
        },
      }),
      db.activityLog.count(),
    ]);

    return NextResponse.json({ activities, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
