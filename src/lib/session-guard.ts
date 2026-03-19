import prisma from "@/lib/prisma";
import { getSession, type Session } from "@/lib/auth";

/**
 * يسترجع الجلسة الحالية ويتحقق من أن المرفق لم يُحذف ناعماً.
 * يُستخدم في Server Actions التي تُجري عمليات كتابة حساسة (خصم، استيراد...).
 *
 * - إذا لم توجد جلسة → returns null
 * - إذا كان المستخدم مشرفاً → يعود بالجلسة مباشرةً (لا حاجة لفحص DB)
 * - إذا كان المرفق محذوفاً ناعماً → returns null (يُعامَل كـ Unauthorized)
 */
export async function requireActiveFacilitySession(): Promise<Session | null> {
  const session = await getSession();
  if (!session) return null;

  // المشرفون يبقون نشطين دائماً — لا يُطبَّق الحذف الناعم عليهم
  if (session.is_admin) return session;

  const facility = await prisma.facility.findFirst({
    where: { id: session.id, deleted_at: null },
    select: { id: true },
  });

  return facility ? session : null;
}
