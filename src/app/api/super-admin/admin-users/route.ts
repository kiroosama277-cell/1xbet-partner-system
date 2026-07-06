import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/require-auth";
import { logAudit } from "@/lib/audit-logger";
import { getClientIP } from "@/lib/auth";

// GET /api/super-admin/admin-users — list all admin users
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  if (authResult.admin.role !== "superadmin") {
    return NextResponse.json({ error: "هذا الاجراء متاح للمشرف العام فقط" }, { status: 403 });
  }

  try {
    const users = await db.admin.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        username: true,
        allowedIPs: true,
        isActive: true,
        role: true,
        lastLoginAt: true,
        lastLoginIP: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch admin users" }, { status: 500 });
  }
}

// POST /api/super-admin/admin-users — create new admin user
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  if (authResult.admin.role !== "superadmin") {
    return NextResponse.json({ error: "هذا الاجراء متاح للمشرف العام فقط" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { username, allowedIPs, role } = body;

    if (!username?.trim()) {
      return NextResponse.json({ error: "اسم المستخدم مطلوب" }, { status: 400 });
    }

    // Check if username exists
    const existing = await db.admin.findUnique({ where: { username: username.trim() } });
    if (existing) {
      return NextResponse.json({ error: "اسم المستخدم موجود بالفعل" }, { status: 409 });
    }

    // Generate unique 6-digit userId
    let userId: string;
    let attempts = 0;
    do {
      userId = Math.floor(100000 + Math.random() * 900000).toString();
      const exists = await db.admin.findUnique({ where: { userId } });
      if (!exists) break;
      attempts++;
    } while (attempts < 20);

    if (attempts >= 20) {
      return NextResponse.json({ error: "Failed to generate unique ID" }, { status: 500 });
    }

    // Generate unique 8-char access code (plain text, shown once)
    const accessCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    const hashedAccessCode = await bcrypt.hash(accessCode, 10);

    const user = await db.admin.create({
      data: {
        userId,
        username: username.trim(),
        accessCode: hashedAccessCode,
        allowedIPs: allowedIPs || "*",
        role: role || "admin",
      },
    });

    // Audit log
    const clientIP = getClientIP(req);
    await logAudit({
      action: "admin_user_create",
      targetType: "admin",
      targetId: user.id,
      targetName: username.trim(),
      newValue: JSON.stringify({ userId, username: username.trim(), role: role || "admin", allowedIPs: allowedIPs || "*" }),
      adminId: authResult.admin.id,
      adminName: authResult.admin.username,
      adminUserId: authResult.admin.userId,
      ipAddress: clientIP,
      details: `إنشاء مستخدم أدمن جديد: ${username.trim()} (ID: ${userId}, الدور: ${role || "admin"})`,
    });

    // Return the user with the PLAIN TEXT access code (only time it's visible)
    return NextResponse.json({ ...user, accessCode }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 });
  }
}

// PATCH /api/super-admin/admin-users — update admin user
export async function PATCH(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  if (authResult.admin.role !== "superadmin") {
    return NextResponse.json({ error: "هذا الاجراء متاح للمشرف العام فقط" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, regenerateCode, allowedIPs, isActive, username, role } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Get old data for audit
    const oldUser = await db.admin.findUnique({ where: { id } });
    if (!oldUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const data: any = {};
    let plainAccessCode: string | undefined;
    if (regenerateCode) {
      plainAccessCode = crypto.randomBytes(4).toString("hex").toUpperCase();
      data.accessCode = await bcrypt.hash(plainAccessCode, 10);
    }
    if (allowedIPs !== undefined) data.allowedIPs = allowedIPs;
    if (isActive !== undefined) data.isActive = isActive;
    if (username !== undefined) data.username = username.trim();
    if (role !== undefined) data.role = role;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const user = await db.admin.update({ where: { id }, data });

    // Audit log
    const clientIP = getClientIP(req);
    const changes: string[] = [];
    if (plainAccessCode) changes.push("توليد كود دخول جديد");
    if (allowedIPs !== undefined) changes.push(`IP: ${allowedIPs}`);
    if (isActive !== undefined) changes.push(isActive ? "تفعيل" : "تعطيل");
    if (username !== undefined) changes.push(`اسم: ${username.trim()}`);
    if (role !== undefined) changes.push(`دور: ${role}`);

    await logAudit({
      action: "admin_user_update",
      targetType: "admin",
      targetId: id,
      targetName: oldUser.username,
      oldValue: JSON.stringify({ username: oldUser.username, isActive: oldUser.isActive, role: oldUser.role, allowedIPs: oldUser.allowedIPs }),
      newValue: JSON.stringify(data),
      adminId: authResult.admin.id,
      adminName: authResult.admin.username,
      adminUserId: authResult.admin.userId,
      ipAddress: clientIP,
      details: `تعديل مستخدم ${oldUser.username} (ID: ${oldUser.userId}) — ${changes.join("، ")}`,
    });

    if (plainAccessCode) {
      return NextResponse.json({ ...user, accessCode: plainAccessCode });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update admin user" }, { status: 500 });
  }
}

// DELETE /api/super-admin/admin-users?id=xxx
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

    const count = await db.admin.count();
    if (count <= 1) {
      return NextResponse.json({ error: "لا يمكن حذف آخر مشرف" }, { status: 400 });
    }

    const userToDelete = await db.admin.findUnique({ where: { id } });
    if (!userToDelete) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    await db.admin.delete({ where: { id } });

    // Audit log
    const clientIP = getClientIP(req);
    await logAudit({
      action: "admin_user_delete",
      targetType: "admin",
      targetId: id,
      targetName: userToDelete.username,
      oldValue: JSON.stringify({ userId: userToDelete.userId, username: userToDelete.username, role: userToDelete.role }),
      adminId: authResult.admin.id,
      adminName: authResult.admin.username,
      adminUserId: authResult.admin.userId,
      ipAddress: clientIP,
      details: `حذف مستخدم أدمن: ${userToDelete.username} (ID: ${userToDelete.userId})`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete admin user" }, { status: 500 });
  }
}
