# Page Smash

اکستنشن اصلی برای خرد کردن هر صفحهٔ وب. یک آدمک جت‌پک روی تب فعلی می‌آید و با فیزیک، متن و تصویر صفحه را از هم می‌پاشد.

ایده از بازی‌های «خراب کردن صفحه» گرفته شده. این پروژه کد، نقاشی و اسم Page Rage را کپی نمی‌کند و به سازنده‌اش وابسته نیست.

## کنترل‌ها

- کلیک روی آیکون اکستنشن: شروع روی همین تب (فقط صفحه‌های `http` و `https`)
- `WASD` یا جهت‌ها: حرکت
- ماوس: نشانه‌گیری
- کلیک چپ: شلیک اصلی، کلیک راست: حالت دوم همان سلاح
- `1` تا `5`: مسلسل، گرانش، شعله‌افکن، لیزر، سیاه‌چاله
- `Space`: دش به سمت نشانه‌
- `Shift+R`: شروع دوبارهٔ همین صفحه
- `Shift+N`: یک صفحهٔ تصادفی ویکی‌پدیا
- وقتی بیشتر تکه‌ها رفتند: «شروع دوباره» یا «ادامه»

پس‌زمینهٔ CSS (عکسی که خودِ تگ نیست) خرد نمی‌شود.

## نصب کروم و اج

1. `chrome://extensions` یا `edge://extensions`
2. Developer mode را روشن کن
3. Load unpacked را بزن و پوشهٔ `dist/chrome` را انتخاب کن (یا خودِ ریشهٔ ریپو؛ `manifest.json` همان نسخهٔ کروم/اج است)

## نصب فایرفاکس

1. در ریپو `bash scripts/pack.sh` را اجرا کن
2. `about:debugging#/runtime/this-firefox`
3. Load Temporary Add-on و فایل `dist/firefox/manifest.json` را انتخاب کن

فایرفاکس ۱۲۸ به بالا.

## English

Page Smash is an original extension: click the toolbar icon on any normal webpage, fly with WASD, aim with the mouse, and break the page with five weapons. Chrome and Edge load the repo root (or `dist/chrome`) unpacked. Firefox loads `dist/firefox` as a temporary add-on. Not affiliated with Page Rage.
