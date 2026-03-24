# Wahda Website

تطبيق ويب مبني على Next.js + Prisma + PostgreSQL لإدارة المستفيدين والخصومات والمنشآت.

## المتطلبات

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## متغيرات البيئة المطلوبة

المشروع يحتاج المتغيرات التالية:

- DATABASE_URL
- JWT_SECRET
- INITIAL_BALANCE (اختياري، الافتراضي 600)

متغيرات اختيارية لإنشاء حساب مدير تلقائياً عند أول تشغيل (فقط إذا لا يوجد مدير نشط):

- DEFAULT_ADMIN_USERNAME
- DEFAULT_ADMIN_PASSWORD
- DEFAULT_ADMIN_NAME

تم إضافة ملفات جاهزة كنقطة بداية:

- .env.example للتطوير المحلي
- .env.production.example للإنتاج

## تشغيل المشروع محلياً بدون Docker

1. تثبيت الحزم:

```bash
npm install
```

2. نسخ ملف البيئة:

```bash
cp .env.example .env
```

على Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. إنشاء الجداول (Prisma migrations):

```bash
npx prisma migrate deploy
```

4. تشغيل وضع التطوير:

```bash
npm run dev
```

التطبيق يعمل على:

http://localhost:3000

## تشغيل المشروع محلياً عبر Docker

تم إضافة الملفات التالية:

- Dockerfile (Multi-stage build للإنتاج)
- docker-compose.yml (app + postgres)
- .dockerignore

تشغيل الخدمات:

```bash
docker compose up -d --build
```

المنفذ الخارجي الافتراضي للتطبيق في Docker هو 3101 (وليس 3000).

لتغييره، عدل APP_HOST_PORT في ملف .env أو مرره مباشرة وقت التشغيل:

```bash
APP_HOST_PORT=9091 docker compose up -d --build
```

على Windows PowerShell:

```powershell
$env:APP_HOST_PORT="9091"; docker compose up -d --build
```

إيقاف الخدمات:

```bash
docker compose down
```

إيقاف الخدمات مع حذف بيانات قاعدة البيانات المحلية:

```bash
docker compose down -v
```

## تشغيل المشروع على سيرفر إنتاج

تم إضافة docker-compose.prod.yml لتشغيل خدمة التطبيق فقط (مع قاعدة بيانات خارجية Managed أو سيرفر منفصل).

1. أنشئ ملف البيئة للإنتاج:

```bash
cp .env.production.example .env.production
```

2. عدل .env.production وضع بيانات قاعدة الإنتاج وJWT_SECRET قوي.

إذا أردت إنشاء مدير افتراضي تلقائياً عند أول تشغيل، أضف المتغيرات التالية في .env.production:

```bash
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=ChangeMe_Immediately
DEFAULT_ADMIN_NAME=System Admin
```

مهم: غيّر DEFAULT_ADMIN_PASSWORD مباشرة بعد أول تسجيل دخول.

يمكنك أيضاً تحديد منفذ الاستضافة الخارجي عبر APP_HOST_PORT (مثال: 9091).

3. شغّل التطبيق:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

4. لمتابعة السجلات:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

## ملاحظات مهمة للإنتاج

- استخدم JWT_SECRET عشوائي وطويل.
- يفضّل استخدام قاعدة بيانات PostgreSQL مُدارة أو مؤمنة بنسخ احتياطي.
- افتح المنفذ 3000 فقط إذا كنت تربط التطبيق مباشرة، أو اربطه خلف Nginx/Caddy كـ reverse proxy مع HTTPS.
- داخل الحاوية يعمل Next.js على المنفذ 3000، أما المنفذ الخارجي في السيرفر فتتحكم به عبر APP_HOST_PORT.
- عند تشغيل الحاوية، يتم تنفيذ:

```bash
npx prisma migrate deploy
```

تلقائياً قبل تشغيل Next.js لضمان تحديث قاعدة البيانات.

كما يتم تنفيذ bootstrap للمدير الافتراضي (إن كانت متغيراته موجودة) مع شرط أمان: لا ينشئ حساب جديد إذا كان هناك مدير نشط بالفعل.
