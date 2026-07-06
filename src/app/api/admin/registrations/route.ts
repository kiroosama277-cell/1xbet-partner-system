import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { logAdminAction } from "@/lib/activity-logger";

// GET /api/admin/registrations
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const status = req.nextUrl.searchParams.get("status");
    const refCode = req.nextUrl.searchParams.get("refCode");
    const search = req.nextUrl.searchParams.get("search");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "200");
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (refCode) where.refCode = refCode;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { promoCode: { contains: search } },
      ];
    }

    const [registrations, total] = await Promise.all([
      db.registration.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          salesRef: { select: { id: true, code: true, name: true } },
          commissions: { select: { id: true, amount: true, status: true, currency: true, month: true, createdAt: true } },
        },
      }),
      db.registration.count({ where }),
    ]);

    return NextResponse.json({ registrations, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}

// PATCH /api/admin/registrations - update registration status/notes or bulk status
export async function PATCH(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const body = await req.json();

    // Bulk status update
    if (body.action === "bulkStatus" && body.ids && body.status) {
      const { ids, status } = body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "IDs array required" }, { status: 400 });
      }

      const result = await db.registration.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { status },
      });

      // Log activity
      await logAdminAction({
        req,
        action: "registration_bulk_update",
        details: `تم تغيير حالة ${result.count} تسجيل إلى "${status}"`,
        admin: authResult.admin,
      });

      return NextResponse.json({ success: true, count: result.count });
    }

    // Single registration update
    const { id, status, notes } = body;
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;

    const registration = await db.registration.update({
      where: { id },
      data,
      include: { salesRef: { select: { name: true } } },
    });

    // Log activity
    await logAdminAction({
      req,
      action: "registration_updated",
      details: `تم تحديث تسجيل ${registration.name} — الحالة: ${status || "بدون تغيير"}`,
      salesRefId: registration.salesRefId || undefined,
      admin: authResult.admin,
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
  }
}

// DELETE /api/admin/registrations - soft delete single, bulk, or all
export async function DELETE(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    // Check for body
    let body: any = {};
    try { body = await req.json(); } catch {}

    // Bulk delete
    if (body.action === "bulkDelete" && body.ids) {
      const { ids } = body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "IDs array required" }, { status: 400 });
      }

      const result = await db.registration.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      // Log activity
      await logAdminAction({
        req,
        action: "registration_bulk_delete",
        details: `تم حذف ${result.count} تسجيل`,
        admin: authResult.admin,
      });

      return NextResponse.json({ success: true, count: result.count });
    }

    // Delete all
    if (body.action === "deleteAll") {
      // Soft delete all non-deleted registrations
      const result = await db.registration.updateMany({
        where: { deletedAt: null },
        data: { deletedAt: new Date() },
      });

      await logAdminAction({
        req,
        action: "registration_delete_all",
        details: `تم حذف جميع التسجيلات (${result.count})`,
        admin: authResult.admin,
      });

      return NextResponse.json({ success: true, count: result.count });
    }

    // Single registration soft delete
    const id = req.nextUrl.searchParams.get("id") || body.id;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const registration = await db.registration.findUnique({ where: { id } });
    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Log activity before soft delete
    await logAdminAction({
      req,
      action: "registration_deleted",
      details: `تم حذف تسجيل: ${registration.name}`,
      salesRefId: registration.salesRefId || undefined,
      admin: authResult.admin,
    });

    // Soft delete: set deletedAt
    await db.registration.update({ where: { id }, data: { deletedAt: new Date() } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 });
  }
}
