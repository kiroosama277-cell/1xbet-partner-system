import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// In-memory rate limiting for registration
const registrationAttempts = new Map<string, { count: number; firstAttempt: number }>();
const REGISTRATION_RATE_LIMIT = 3; // Max 3 registrations per IP per hour
const REGISTRATION_RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRegistrationRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = registrationAttempts.get(ip);

  if (!entry || now - entry.firstAttempt > REGISTRATION_RATE_WINDOW) {
    registrationAttempts.set(ip, { count: 1, firstAttempt: now });
    return true;
  }

  if (entry.count >= REGISTRATION_RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

// Input sanitization helpers
function sanitizeString(input: string): string {
  return input.trim().replace(/<[^>]*>/g, "");
}

function isValidEmail(email: string): boolean {
  // Stricter: requires @ and a TLD of at least 2 chars
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // International phone: optional + followed by 7-15 digits (spaces/hyphens allowed between digits)
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneRegex = /^\+?[\d\s-]{7,20}$/;
  return phoneRegex.test(phone) && phoneDigits.length >= 7 && phoneDigits.length <= 15;
}

function isValidName(name: string): boolean {
  // Allow letters (Latin, Arabic, Cyrillic via Unicode property escapes), spaces, hyphens, apostrophes
  // At least 3 chars
  return name.length >= 3 && /^[\p{L}\p{M}\s'-]+$/u.test(name);
}

export async function POST(req: NextRequest) {
  try {
    // --- Rate Limiting Check ---
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIP = forwarded ? forwarded.split(",")[0].trim() : (req.headers.get("x-real-ip") || "unknown");

    if (!checkRegistrationRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "تم تجاوز عدد التسجيلات المسموحة. حاول مرة أخرى لاحقاً", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await req.json();
    let { name, email, phone, country, promoCode, trafficSource, channelDesc, refCode } = body;

    // Sanitize all string inputs
    name = sanitizeString(String(name || ""));
    email = sanitizeString(String(email || ""));
    phone = sanitizeString(String(phone || ""));
    country = sanitizeString(String(country || ""));
    promoCode = sanitizeString(String(promoCode || ""));
    trafficSource = sanitizeString(String(trafficSource || ""));
    channelDesc = channelDesc ? sanitizeString(String(channelDesc)) : null;
    refCode = refCode ? sanitizeString(String(refCode)) : null;

    // Check required fields
    if (!name || !email || !phone || !country || !promoCode || !trafficSource) {
      return NextResponse.json({ error: "جميع الحقول المطلوبة يجب تعبئتها" }, { status: 400 });
    }

    // Validate string lengths
    if (name.length > 100) {
      return NextResponse.json({ error: "الاسم طويل جداً (الحد الأقصى 100 حرف)" }, { status: 400 });
    }
    if (email.length > 255) {
      return NextResponse.json({ error: "البريد الإلكتروني طويل جداً (الحد الأقصى 255 حرف)" }, { status: 400 });
    }
    if (phone.length > 20) {
      return NextResponse.json({ error: "رقم الهاتف طويل جداً (الحد الأقصى 20 حرف)" }, { status: 400 });
    }

    // Validate name (at least 3 chars, only letters/spaces/hyphens)
    if (!isValidName(name)) {
      return NextResponse.json({ error: "الاسم يجب أن يحتوي على 3 أحرف على الأقل وأحرف ومسافات فقط" }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "صيغة البريد الإلكتروني غير صحيحة" }, { status: 400 });
    }

    // Validate phone format
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "رقم الهاتف غير صحيح (يجب أن يحتوي على 7-15 رقماً)" }, { status: 400 });
    }

    const promoUpper = promoCode.trim().toUpperCase();

    // Check if promo code already exists
    const existingPromo = await db.registration.findFirst({
      where: { promoCode: promoUpper, deletedAt: null },
    });
    if (existingPromo) {
      return NextResponse.json({ error: "هذا الرمز الترويجي مسجَّل بالفعل. يرجى اختيار رمز مختلف." }, { status: 409 });
    }

    // Check if same email already registered
    const existingEmail = await db.registration.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
    if (existingEmail) {
      return NextResponse.json({ error: "هذا البريد الإلكتروني مسجَّل بالفعل. يرجى استخدام بريد مختلف." }, { status: 409 });
    }

    // Check if same phone already registered
    const existingPhone = await db.registration.findFirst({
      where: { phone: phone.trim(), deletedAt: null },
    });
    if (existingPhone) {
      return NextResponse.json({ error: "رقم الهاتف هذا مسجَّل بالفعل. يرجى استخدام رقم مختلف." }, { status: 409 });
    }

    // Find the sales ref if a refCode was provided (case-insensitive)
    let salesRefId: string | null = null;
    if (refCode) {
      const salesRef = await db.salesRef.findUnique({ where: { code: refCode.toLowerCase() } });
      if (salesRef) {
        salesRefId = salesRef.id;
      }
    }

    // Save the registration
    const registration = await db.registration.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone.trim(),
        country,
        promoCode: promoUpper,
        trafficSource,
        channelDesc,
        refCode,
        salesRefId,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: "registration",
        details: `تسجيل جديد: ${name} من ${country}${refCode ? ` عبر ${refCode}` : ""}`,
        salesRefId,
      },
    });

    // Auto-create commission if sales ref exists
    if (salesRefId) {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      // Get commission amount from settings (default 5 USD)
      let commissionAmount = 5;
      try {
        const setting = await db.settings.findUnique({ where: { key: "commission_amount" } });
        if (setting) commissionAmount = parseFloat(setting.value);
      } catch {}

      await db.commission.create({
        data: {
          salesRefId,
          registrationId: registration.id,
          amount: commissionAmount,
          currency: "USD",
          status: "pending",
          month,
        },
      });
    }

    return NextResponse.json({ success: true, id: registration.id }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم، يرجى المحاولة لاحقًا" }, { status: 500 });
  }
}
