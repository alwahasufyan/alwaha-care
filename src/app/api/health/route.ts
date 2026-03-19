import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/health
 * نقطة فحص صحة الخدمة — تُستخدم من قِبل load balancers وأدوات المراقبة.
 * لا تتطلب تسجيل دخول — تُرجع 200 إذا كانت قاعدة البيانات متاحة، 503 إذا لا.
 */
export async function GET() {
  try {
    // استعلام خفيف للتحقق من اتصال قاعدة البيانات
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        db: "connected",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        db: "unreachable",
      },
      { status: 503 }
    );
  }
}
