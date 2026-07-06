import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { logAdminAction } from "@/lib/activity-logger";

// GET /api/admin/refs
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const refs = await db.salesRef.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { registrations: true, commissions: true } },
      },
    });
    return NextResponse.json(refs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch refs" }, { status: 500 });
  }
}

// POST /api/admin/refs - create a new sales ref
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const body = await req.json();
    const { code, name, email, phone, target } = body;

    if (!code?.trim() || !name?.trim()) {
      return NextResponse.json({ error: "Code and name are required" }, { status: 400 });
    }

    const existing = await db.salesRef.findUnique({ where: { code: code.trim().toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "This code already exists" }, { status: 409 });
    }

    const ref = await db.salesRef.create({
      data: {
        code: code.trim().toLowerCase(),
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        target: target ? parseInt(target) : 50,
      },
    });

    // Log activity
    await logAdminAction({
      req,
      action: "sales_added",
      details: `تم إضافة سيلز جديد: ${name} (${code})`,
      salesRefId: ref.id,
      admin: authResult.admin,
    });

    return NextResponse.json(ref, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create ref" }, { status: 500 });
  }
}

// PATCH /api/admin/refs - update sales ref
export async function PATCH(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const body = await req.json();
    const { id, name, email, phone, target, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (email !== undefined) data.email = email?.trim() || null;
    if (phone !== undefined) data.phone = phone?.trim() || null;
    if (target !== undefined) data.target = parseInt(target);
    if (isActive !== undefined) data.isActive = isActive;

    const ref = await db.salesRef.update({ where: { id }, data });

    // Log activity
    await logAdminAction({
      req,
      action: "sales_updated",
      details: `تم تحديث بيانات السيلز: ${ref.name}`,
      salesRefId: ref.id,
      admin: authResult.admin,
    });

    return NextResponse.json(ref);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update ref" }, { status: 500 });
  }
}

// DELETE /api/admin/refs?id=xxx - soft delete
export async function DELETE(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const ref = await db.salesRef.findUnique({ where: { id } });

    // Log activity before soft delete
    if (ref) {
      await logAdminAction({
        req,
        action: "sales_deleted",
        details: `تم حذف السيلز: ${ref.name} (${ref.code})`,
        admin: authResult.admin,
      });
    }

    // Soft delete: set deletedAt and delete related activity logs
    await db.activityLog.deleteMany({ where: { salesRefId: id } });
    await db.salesRef.update({ where: { id }, data: { deletedAt: new Date() } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete ref" }, { status: 500 });
  }
}
