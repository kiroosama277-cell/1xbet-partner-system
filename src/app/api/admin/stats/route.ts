import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

// GET /api/admin/stats - comprehensive statistics
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) return authResult.response;
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalRegistrations,
      totalSalesRefs,
      activeSalesRefs,
      todayRegistrations,
      weekRegistrations,
      monthRegistrations,
      refRegistrations,
      commissions,
      recentRegs,
    ] = await Promise.all([
      db.registration.count({ where: { deletedAt: null } }),
      db.salesRef.count({ where: { deletedAt: null } }),
      db.salesRef.count({ where: { isActive: true, deletedAt: null } }),
      db.registration.count({ where: { createdAt: { gte: today }, deletedAt: null } }),
      db.registration.count({ where: { createdAt: { gte: startOfWeek }, deletedAt: null } }),
      db.registration.count({ where: { createdAt: { gte: startOfMonth }, deletedAt: null } }),
      db.registration.count({ where: { refCode: { not: null }, deletedAt: null } }),
      db.commission.findMany({
        where: { deletedAt: null },
        include: { salesRef: { select: { name: true } } },
      }),
      db.registration.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { salesRef: { select: { name: true, code: true } } },
      }),
    ]);

    const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);
    const pendingCommission = commissions.filter((c) => c.status === "pending").reduce((sum, c) => sum + c.amount, 0);
    const paidCommission = commissions.filter((c) => c.status === "paid").reduce((sum, c) => sum + c.amount, 0);
    const approvedCommission = commissions.filter((c) => c.status === "approved").reduce((sum, c) => sum + c.amount, 0);

    // Per-sales stats
    const salesRefs = await db.salesRef.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { registrations: true, commissions: true } },
        registrations: {
          where: { createdAt: { gte: startOfMonth }, deletedAt: null },
          select: { id: true },
        },
      },
    });

    const salesStats = salesRefs.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      email: s.email,
      phone: s.phone,
      target: s.target,
      isActive: s.isActive,
      totalRegs: s._count.registrations,
      monthRegs: s.registrations.length,
      totalCommissions: s._count.commissions,
      progress: s.target > 0 ? Math.round((s.registrations.length / s.target) * 100) : 0,
    }));

    // Country stats
    const allRegs = await db.registration.findMany({
      where: { deletedAt: null },
      select: { country: true, trafficSource: true, createdAt: true, refCode: true },
    });

    const countryStats: Record<string, number> = {};
    const sourceStats: Record<string, number> = {};
    allRegs.forEach((r) => {
      countryStats[r.country] = (countryStats[r.country] || 0) + 1;
      sourceStats[r.trafficSource] = (sourceStats[r.trafficSource] || 0) + 1;
    });

    // Daily registrations last 14 days
    const daily: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const count = allRegs.filter((r) => new Date(r.createdAt).toDateString() === dateStr).length;
      daily.push({ date: d.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric", month: "short" }), count });
    }

    return NextResponse.json({
      overview: {
        totalRegistrations,
        totalSalesRefs,
        activeSalesRefs,
        todayRegistrations,
        weekRegistrations,
        monthRegistrations,
        refRegistrations,
        conversionRate: totalRegistrations > 0 ? Math.round((refRegistrations / totalRegistrations) * 100) : 0,
      },
      commissions: {
        total: totalCommission,
        pending: pendingCommission,
        approved: approvedCommission,
        paid: paidCommission,
      },
      salesStats,
      countryStats: Object.entries(countryStats)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([country, count]) => ({ country, count })),
      sourceStats: Object.entries(sourceStats)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([source, count]) => ({ source, count })),
      daily,
      recentRegs,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
