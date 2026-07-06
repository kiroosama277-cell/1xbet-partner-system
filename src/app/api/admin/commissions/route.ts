import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { logAdminAction } from "@/lib/activity-logger";

// GET /api/admin/commissions
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const status = req.nextUrl.searchParams.get("status");
    const month = req.nextUrl.searchParams.get("month");

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (month) where.month = month;

    const commissions = await db.commission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        salesRef: { select: { id: true, code: true, name: true } },
        registration: { select: { id: true, name: true, country: true } },
      },
    });

    // Summary stats
    const total = commissions.reduce((sum, c) => sum + c.amount, 0);
    const pending = commissions.filter((c) => c.status === "pending").reduce((sum, c) => sum + c.amount, 0);
    const approved = commissions.filter((c) => c.status === "approved").reduce((sum, c) => sum + c.amount, 0);
    const paid = commissions.filter((c) => c.status === "paid").reduce((sum, c) => sum + c.amount, 0);

    return NextResponse.json({
      commissions,
      summary: { total, pending, approved, paid, count: commissions.length },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch commissions" }, { status: 500 });
  }
}

// POST /api/admin/commissions - create commission
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const body = await req.json();
    const { salesRefId, registrationId, amount, currency, month } = body;

    if (!salesRefId || !registrationId || !amount || !month) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const commission = await db.commission.create({
      data: {
        salesRefId,
        registrationId,
        amount: parseFloat(amount),
        currency: currency || "USD",
        status: "pending",
        month,
      },
      include: {
        salesRef: { select: { name: true, code: true } },
        registration: { select: { name: true } },
      },
    });

    // Log activity
    await logAdminAction({
      req,
      action: "commission_added",
      details: `عمولة ${commission.amount} ${commission.currency} لـ ${commission.salesRef.name}`,
      salesRefId,
      admin: authResult.admin,
    });

    return NextResponse.json(commission, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create commission" }, { status: 500 });
  }
}

// PATCH /api/admin/commissions - update commission status
export async function PATCH(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required" }, { status: 400 });
    }

    const commission = await db.commission.update({
      where: { id },
      data: {
        status,
        paidAt: status === "paid" ? new Date() : undefined,
      },
      include: {
        salesRef: { select: { name: true } },
      },
    });

    // Log activity
    const statusText = status === "approved" ? "معتمدة" : status === "paid" ? "مدفوعة" : status;
    await logAdminAction({
      req,
      action: "commission_updated",
      details: `عمولة ${commission.amount} ${commission.currency} لـ ${commission.salesRef.name} — الحالة: ${statusText}`,
      salesRefId: commission.salesRefId,
      admin: authResult.admin,
    });

    return NextResponse.json(commission);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update commission" }, { status: 500 });
  }
}

// DELETE /api/admin/commissions?id=xxx - soft delete
export async function DELETE(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const commission = await db.commission.findUnique({ where: { id } });

    // Log activity before soft delete
    if (commission) {
      await logAdminAction({
        req,
        action: "commission_deleted",
        details: `تم حذف عمولة ${commission.amount} ${commission.currency}`,
        salesRefId: commission.salesRefId,
        admin: authResult.admin,
      });
    }

    // Soft delete: set deletedAt
    await db.commission.update({ where: { id }, data: { deletedAt: new Date() } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete commission" }, { status: 500 });
  }
}
