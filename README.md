# NONEcore Bot - ربات اهدای کانفیگ VPN

ربات تلگرامی برای استخراج و ارسال کانفیگ از فایل HTML یا متن لینک.

## امکانات
- استخراج از فایل HTML یا متن مستقیم
- جلوگیری از تکرار + حذف کانفیگ‌های قدیمی‌تر از ۱۰ روز
- کیبورد معمولی دو ستونی
- دکمه‌های اصلی: آپلود، ارسال دستی، آمار، ارسال پیام به کانال، پاک کردن تکراری‌ها
- متن پست کامل با لوکیشن، پینگ، spoiler، ریمارک (@nonecorebot + اختصار لوکیشن)
- پیام زیر پست فقط آمار ارسال
- کانفیگ‌های ارسال‌شده از صف پاک می‌شن
- ریمارک در کلاینت: @nonecorebot + اختصار انگلیسی لوکیشن

## نصب روی Railway.app
1. ریپو رو در GitHub بساز و فایل‌ها رو آپلود کن
2. در Railway → New Project → Deploy from GitHub repo
3. در Variables اضافه کن:
   BOT_TOKEN=توکن ربات
   ADMIN_ID=آیدی عددی خودت
   BRAND_NAME=NONEcore
   CHANNELS=@nonecorebot
   DATABASE_PATH=database.db
4. Start Command: pip install -r requirements.txt && python main.py
5. Deploy بزن

## نصب روی VPS
1. git clone ریپو
2. cd ریپو
3. pip install -r requirements.txt
4. nano .env و متغیرها رو وارد کن
5. python main.py

موفق باشی!
