"use client";

import React, { useActionState } from "react";
import { authenticate } from "@/app/actions/auth";
import { Button, Input, Card } from "@/components/ui";
import { Loader2, Lock, ShieldCheck, User } from "lucide-react";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-4 flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="data:image/png;base64,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" alt="شعار شركة وعد" width={72} height={72} className="object-contain" />
            <div>
              <p className="text-base font-black text-slate-900">شركة وعد</p>
              <p className="text-xs font-medium text-primary">لإدارة النفقات الصحية</p>
            </div>
          </div>
          <h2 className="section-title text-2xl font-black text-slate-950">تسجيل الدخول</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">الرجاء إدخال بيانات الدخول للوصول إلى النظام.</p>
        </div>

        <Card className="p-6">
          <form action={action} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="mr-1 block text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                  اسم المستخدم
                </label>
                <div className="relative group">
                  <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
                  <Input
                    name="username"
                    autoComplete="username"
                    placeholder="اكتب اسم المستخدم"
                    className="h-12 pr-12 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="mr-1 block text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                  كلمة المرور
                </label>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
                  <Input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-12 pr-12 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {state?.error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="animate-shake text-center text-sm font-bold text-red-600">
                  {state.error}
                </p>
              </div>
            )}

            <Button type="submit" className="h-12 w-full text-base" disabled={isPending}>
              {isPending ? <Loader2 className="ml-2 h-6 w-6 animate-spin" /> : null}
              {isPending ? "جارٍ التحقق" : "دخول إلى المنصة"}
            </Button>
          </form>
        </Card>

        <div className="mt-4 rounded-md border border-slate-200 bg-white p-3 text-center text-xs text-slate-500">
          <div className="mb-1 flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-bold text-slate-700">وصول خاص بالمرافق الصحية</span>
          </div>
          يرجى استخدام بيانات الاعتماد المعتمدة من إدارة النظام.
        </div>
      </div>
    </div>
  );
}
