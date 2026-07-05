# Mizar Template Editing Guide

## الهدف
بدل تعديل صفحة القوالب كل مرة، القوالب كلها أصبحت في ملف واحد:

`src/storefront/templates/theme-catalog.ts`

## تعديل قالب موجود
افتح `TEMPLATE_CATALOG` وعدل بيانات القالب:

- `title`: اسم القالب
- `subtitle`: وصف قصير
- `description`: وصف الكارت
- `palette`: ألوان القالب والمعاينة
- `features`: مميزات القالب
- `preview`: شكل المعاينة المصغرة
- `status`: اجعلها `ready` لو القالب جاهز أو `soon` لو لسه قيد التطوير

## إضافة قالب جديد بصريًا
1. أضف مفتاح جديد في TypeScript union `TemplateKey`.
2. أضف object جديد داخل `TEMPLATE_CATALOG`.
3. اجعل `status: "soon"` حتى تنتهي من تنفيذ صفحات القالب.

## تحويله لقالب حقيقي
بعد إضافة الكارت، نفذ ملفات القالب داخل:

`src/storefront/templates/<template-folder>`

ثم حدث:

`src/storefront/templates/_shared/StorefrontTemplateRouter.tsx`

ليختار صفحات القالب الجديد حسب `templateKey`.

## مهم
تغيير بيانات الكارت والمعاينة لا ينشئ storefront كامل تلقائيًا. هو يجعل إدارة القوالب أسهل، لكن تنفيذ قالب جديد بالكامل يحتاج components/pages جديدة.
