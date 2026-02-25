// API Route برای Webhook ربات تلگرام
import { NextRequest, NextResponse } from 'next/server';

// متغیرهای محیطی
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || BOT_TOKEN;

// تنظیم Webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';

  // لایز پاسخ (برای جلوگیری از خطای import)
  let bot: any = null;
  
  try {
    const botModule = await import('@/lib/bot');
    bot = botModule.bot;
  } catch (error) {
    console.error('Error importing bot:', error);
  }

  if (action === 'set' && bot) {
    try {
      const webhookUrl = `${protocol}://${host}/api/bot`;
      const result = await bot.telegram.setWebhook(webhookUrl, {
        secret_token: WEBHOOK_SECRET,
      });

      return NextResponse.json({
        ok: true,
        webhook: webhookUrl,
        result,
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        error: String(error),
      }, { status: 500 });
    }
  }

  if (action === 'info' && bot) {
    try {
      const info = await bot.telegram.getWebhookInfo();
      return NextResponse.json({
        ok: true,
        info,
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        error: String(error),
      }, { status: 500 });
    }
  }

  if (action === 'delete' && bot) {
    try {
      const result = await bot.telegram.deleteWebhook();
      return NextResponse.json({
        ok: true,
        result,
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        error: String(error),
      }, { status: 500 });
    }
  }

  // صفحه پیش‌فرض
  return NextResponse.json({
    ok: true,
    message: 'Telegram Bot Webhook Endpoint',
    endpoints: {
      setWebhook: '?action=set',
      getWebhookInfo: '?action=info',
      deleteWebhook: '?action=delete',
    },
    host,
    protocol,
  });
}

// دریافت آپدیت از تلگرام
export async function POST(request: NextRequest) {
  try {
    // بررسی secret token
    const secretToken = request.headers.get('x-telegram-bot-api-secret-token');
    if (secretToken && secretToken !== WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // دریافت آپدیت
    const update = await request.json();

    // import ربات
    const botModule = await import('@/lib/bot');
    const bot = botModule.bot;

    // پردازش آپدیت
    await bot.handleUpdate(update);

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({
      ok: false,
      error: String(error),
    }, { status: 500 });
  }
}
