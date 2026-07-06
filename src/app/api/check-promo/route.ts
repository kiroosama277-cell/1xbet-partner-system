import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    if (!code?.trim()) {
      return NextResponse.json({ available: false });
    }

    const existing = await db.registration.findFirst({
      where: { promoCode: code.trim().toUpperCase(), deletedAt: null },
    });

    return NextResponse.json({ available: !existing });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ available: false }, { status: 500 });
  }
}
