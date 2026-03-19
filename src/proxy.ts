import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import prisma from "@/lib/prisma";

const publicRoutes = ["/login", "/api/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get("session")?.value;
  let session = null;

  if (cookie) {
    try {
      session = await decrypt(cookie) as { id: string; is_admin?: boolean; must_change_password?: boolean } | null;
    } catch {
      // رمز الجلسة غير صالح
    }
  }

  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session) {
    if (session.must_change_password) {
      return NextResponse.redirect(new URL("/change-password", req.nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // ── التحقق من أن المرفق غير محذوف (حماية الجلسات النشطة) ──
  // المشرفون لا يخضعون للحذف الناعم
  if (session && !session.is_admin) {
    const facility = await prisma.facility.findFirst({
      where: { id: session.id, deleted_at: null },
      select: { id: true },
    });
    if (!facility) {
      const response = NextResponse.redirect(new URL("/login", req.nextUrl));
      response.cookies.set("session", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      return response;
    }
  }

  // إجبار المستخدم على تغيير كلمة المرور قبل أي صفحة أخرى
  if (session?.must_change_password && path !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", req.nextUrl));
  }

  // إذا لم يكن بحاجة لتغيير كلمة المرور لا يُسمح بالوصول لصفحة الإجبار
  if (path === "/change-password" && session && !session.must_change_password) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // حماية مسارات /admin للمشرفين فقط
  if (path.startsWith("/admin") && !session?.is_admin) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
