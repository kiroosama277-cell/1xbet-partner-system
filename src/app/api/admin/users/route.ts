import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/require-auth";
import { logAdminAction } from "@/lib/activity-logger";

// GET /api/admin/users — list all admin users (superadmin only)
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
        accessCode: true,
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
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/admin/users — create new admin user (superadmin only)
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

    // Generate unique 8-char access code (plain text, to be shown once)
    const accessCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    
    // Hash the access code with bcrypt before storing
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

    // Log the action
    await logAdminAction({
      req,
      action: "user_create",
      details: `إنشاء مستخدم جديد: ${username.trim()} (ID: ${userId}, الدور: ${role || "admin"})`,
      admin: authResult.admin,
    });

    // Return the user with the PLAIN TEXT access code (only time it's visible)
    return NextResponse.json({ ...user, accessCode }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// PATCH /api/admin/users — update user (superadmin only)
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

    const data: any = {};
    let plainAccessCode: string | undefined;
    if (regenerateCode) {
      // Generate new plain text access code
      plainAccessCode = crypto.randomBytes(4).toString("hex").toUpperCase();
      // Hash it before storing
      data.accessCode = await bcrypt.hash(plainAccessCode, 10);
    }
    if (allowedIPs !== undefined) {
      data.allowedIPs = allowedIPs;
    }
    if (isActive !== undefined) {
      data.isActive = isActive;
    }
    if (username !== undefined) {
      data.username = username.trim();
    }
    if (role !== undefined) {
      data.role = role;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const user = await db.admin.update({ where: { id }, data });

    // Build a description of what changed for the activity log
    const changes: string[] = [];
    if (plainAccessCode) changes.push("توليد كود جديد");
    if (allowedIPs !== undefined) changes.push(`IP: ${allowedIPs}`);
    if (isActive !== undefined) changes.push(isActive ? "تفعيل" : "تعطيل");
    if (username !== undefined) changes.push(`اسم: ${username.trim()}`);
    if (role !== undefined) changes.push(`دور: ${role}`);

    await logAdminAction({
      req,
      action: "user_update",
      details: `تعديل مستخدم ${user.username} (ID: ${user.userId}) — ${changes.join("، ")}`,
      admin: authResult.admin,
    });

    // If code was regenerated, return the plain text code in response
    if (plainAccessCode) {
      return NextResponse.json({ ...user, accessCode: plainAccessCode });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/admin/users?id=xxx (superadmin only)
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

    // Prevent deleting the last admin
    const count = await db.admin.count();
    if (count <= 1) {
      return NextResponse.json({ error: "لا يمكن حذف آخر مشرف" }, { status: 400 });
    }

    // Get user info before deletion for logging
    const userToDelete = await db.admin.findUnique({ where: { id } });
    if (!userToDelete) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    await db.admin.delete({ where: { id } });

    await logAdminAction({
      req,
      action: "user_delete",
      details: `حذف مستخدم: ${userToDelete.username} (ID: ${userToDelete.userId})`,
      admin: authResult.admin,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
