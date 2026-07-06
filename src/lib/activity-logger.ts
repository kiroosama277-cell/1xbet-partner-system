import { db } from "./db";
import { getClientIP } from "./auth";
import type { NextRequest } from "next/server";

interface LogParams {
  req: NextRequest;
  action: string;
  details?: string;
  salesRefId?: string;
  admin: {
    id: string;
    userId: string;
    username: string;
  };
}

/**
 * Log an admin action to the ActivityLog table.
 * Captures: who (admin), what (action + details), when (createdAt), from (ipAddress).
 */
export async function logAdminAction({
  req,
  action,
  details,
  salesRefId,
  admin,
}: LogParams) {
  try {
    const ipAddress = getClientIP(req);
    await db.activityLog.create({
      data: {
        action,
        details: details || null,
        salesRefId: salesRefId || null,
        adminId: admin.id,
        adminName: admin.username,
        adminUserId: admin.userId,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
    // Don't throw — logging should never break the main operation
  }
}
