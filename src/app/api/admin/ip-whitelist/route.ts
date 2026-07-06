import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { logAdminAction } from "@/lib/activity-logger";
import { logAudit } from "@/lib/audit-logger";
import { getClientIP } from "@/lib/auth";

// GET /api/admin/ip-whitelist — list all whitelisted IPs (superadmin only)
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  if (authResult.admin.role !== "superadmin") {
    return NextResponse.json({ error: "هذا الاجراء متاح للمشرف العام فقط" }, { status: 403 });
  }
  try {
    const ips = await db.iPWhitelist.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(ips);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch IP whitelist" }, { status: 500 });
  }
}

// POST /api/admin/ip-whitelist — add IP to whitelist (superadmin only)
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  if (authResult.admin.role !== "superadmin") {
    return NextResponse.json({ error: "هذا الاجراء متاح للمشرف العام فقط" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { ip, label } = body;

    if (!ip?.trim()) {
      return NextResponse.json({ error: "عنوان IP مطلوب" }, { status: 400 });
    }

    // Validate IP format (basic check)
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(\.\*)?$/;
    const cleanedIP = ip.trim();
    if (!ipPattern.test(cleanedIP) && cleanedIP !== "*") {
      return NextResponse.json({ error: "صيغة IP غير صحيحة" }, { status: 400 });
    }

    // Check if IP already exists
    const existing = await db.iPWhitelist.findUnique({ where: { ip: cleanedIP } });
    if (existing) {
      // If exists but inactive, reactivate it
      if (!existing.isActive) {
        const updated = await db.iPWhitelist.update({
          where: { id: existing.id },
          data: { isActive: true, label: label || existing.label, addedBy: authResult.admin.userId },
        });
        await logAdminAction({
          req,
          action: "ip_whitelist_reactivate",
          details: `إعادة تفعيل IP في القائمة البيضاء: ${cleanedIP}${label ? ` (${label})` : ""}`,
          admin: authResult.admin,
        });
        return NextResponse.json(updated);
      }
      return NextResponse.json({ error: "عنوان IP موجود بالفعل في القائمة البيضاء" }, { status: 409 });
    }

    const ipEntry = await db.iPWhitelist.create({
      data: {
        ip: cleanedIP,
        label: label || null,
        addedBy: authResult.admin.userId,
      },
    });

    await logAdminAction({
      req,
      action: "ip_whitelist_add",
      details: `إضافة IP للقائمة البيضاء: ${cleanedIP}${label ? ` (${label})` : ""}`,
      admin: authResult.admin,
    });

    // Audit log
    await logAudit({
      action: "ip_whitelist_add",
      targetType: "ip_whitelist",
      targetId: ipEntry.id,
      targetName: cleanedIP,
      newValue: JSON.stringify({ ip: cleanedIP, label: label || null }),
      adminId: authResult.admin.id,
      adminName: authResult.admin.username,
      adminUserId: authResult.admin.userId,
      ipAddress: getClientIP(req),
      details: `إضافة IP للقائمة البيضاء: ${cleanedIP}${label ? ` (${label})` : ""}`,
    });

    return NextResponse.json(ipEntry, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add IP to whitelist" }, { status: 500 });
  }
}

// PATCH /api/admin/ip-whitelist — toggle IP active status (superadmin only)
export async function PATCH(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  if (authResult.admin.role !== "superadmin") {
    return NextResponse.json({ error: "هذا الاجراء متاح للمشرف العام فقط" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { id, isActive, label } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const data: any = {};
    if (isActive !== undefined) data.isActive = isActive;
    if (label !== undefined) data.label = label;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const ipEntry = await db.iPWhitelist.update({ where: { id }, data });

    const changes: string[] = [];
    if (isActive !== undefined) changes.push(isActive ? "تفعيل" : "تعطيل");
    if (label !== undefined) changes.push(`تسمية: ${label}`);

    await logAdminAction({
      req,
      action: "ip_whitelist_update",
      details: `تعديل IP في القائمة البيضاء: ${ipEntry.ip} — ${changes.join("، ")}`,
      admin: authResult.admin,
    });

    return NextResponse.json(ipEntry);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update IP entry" }, { status: 500 });
  }
}

// DELETE /api/admin/ip-whitelist?id=xxx (superadmin only)
export async function DELETE(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  if (authResult.admin.role !== "superadmin") {
    return NextResponse.json({ error: "هذا الاجراء متاح للمشرف العام فقط" }, { status: 403 });
  }
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Get IP info before deletion for logging
    const ipToDelete = await db.iPWhitelist.findUnique({ where: { id } });
    if (!ipToDelete) {
      return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
    }

    await db.iPWhitelist.delete({ where: { id } });

    await logAdminAction({
      req,
      action: "ip_whitelist_delete",
      details: `حذف IP من القائمة البيضاء: ${ipToDelete.ip}${ipToDelete.label ? ` (${ipToDelete.label})` : ""}`,
      admin: authResult.admin,
    });

    // Audit log
    await logAudit({
      action: "ip_whitelist_delete",
      targetType: "ip_whitelist",
      targetId: id,
      targetName: ipToDelete.ip,
      oldValue: JSON.stringify({ ip: ipToDelete.ip, label: ipToDelete.label, isActive: ipToDelete.isActive }),
      adminId: authResult.admin.id,
      adminName: authResult.admin.username,
      adminUserId: authResult.admin.userId,
      ipAddress: getClientIP(req),
      details: `حذف IP من القائمة البيضاء: ${ipToDelete.ip}${ipToDelete.label ? ` (${ipToDelete.label})` : ""}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete IP entry" }, { status: 500 });
  }
}
