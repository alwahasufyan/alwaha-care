/**
 * In-memory rate limiter — مناسب للنشر الفردي (single instance).
 * يتتبع عدد المحاولات لكل username خلال نافذة زمنية محددة.
 */

interface Bucket {
  count: number;
  resetAt: number; // timestamp ms
}

// Map<key, Bucket> — لا تحتاج مكتبة خارجية
const store = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000; // نافذة 15 دقيقة
const MAX_ATTEMPTS = 10;           // 10 محاولات كحد أقصى قبل الحجب

/** يُرجع null إذا مسموح، أو رسالة خطأ إذا تجاوز الحد */
export function checkRateLimit(key: string): string | null {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    // نافذة جديدة
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    const remainingMinutes = Math.ceil((bucket.resetAt - now) / 60000);
    return `تم تجاوز الحد المسموح به. يرجى المحاولة بعد ${remainingMinutes} دقيقة.`;
  }

  bucket.count += 1;
  return null;
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}

// تنظيف تلقائي كل 30 دقيقة لمنع تسرب الذاكرة
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store.entries()) {
      if (now >= bucket.resetAt) store.delete(key);
    }
  }, 30 * 60 * 1000);
}
