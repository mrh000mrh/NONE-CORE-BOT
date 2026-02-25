// ربات تلگرام - تنظیمات اصلی
import { Telegraf, Context, Markup } from 'telegraf';
import { message } from 'telegraf/filters';

// تایپ‌ها
interface BotContext extends Context {
  session?: {
    state?: 'waiting_html' | 'waiting_sub' | 'waiting_count' | 'waiting_message';
    sourceText?: string;
  };
}

// متغیرهای محیطی
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ADMIN_ID = process.env.ADMIN_ID || '';
const CHANNEL_ID = process.env.CHANNEL_ID || '';
const BOT_USERNAME = process.env.BOT_USERNAME || 'nonecorebot';

// ایجاد نمونه ربات
export const bot = new Telegraf<BotContext>(BOT_TOKEN);

// کیبورد اصلی
const mainKeyboard = Markup.keyboard([
  ['📤 آپلود HTML', '🔗 لینک ساب'],
  ['📤 ارسال دستی', '📊 آمار'],
  ['⚙️ تنظیمات', '🗑️ پاک کردن'],
]).resize().persistent();

// پیام خوش‌آمدگویی
const WELCOME_MESSAGE = `👋 سلام!

به ربات استخراج و ارسال کانفیگ خوش آمدید.

📌 قابلیت‌ها:
• استخراج کانفیگ از HTML/متن/لینک
• پشتیبانی از VLESS, VMess, Trojan, SS, SSR, Tuic, Hysteria2
• جلوگیری از ارسال تکراری
• ارسال خودکار به کانال
• ریمارک اختصاصی روی کانفیگ‌ها

━━━━━━━━━━━━━━━━━
📢 کانال مقصد: ${CHANNEL_ID}
🤖 ربات: @${BOT_USERNAME}`;

// middleware برای بررسی ادمین
const adminOnly = async (ctx: Context, next: () => Promise<void>) => {
  const userId = ctx.from?.id?.toString();
  if (userId !== ADMIN_ID) {
    await ctx.reply('⛔ شما دسترسی به این ربات ندارید.');
    return;
  }
  return next();
};

// middleware برای مدیریت نشست
const sessionMiddleware = (ctx: BotContext, next: () => Promise<void>) => {
  if (!ctx.session) {
    ctx.session = {};
  }
  return next();
};

// تنظیم middlewares
bot.use(adminOnly);
bot.use(sessionMiddleware);

// دستور /start
bot.command('start', async (ctx) => {
  await ctx.reply(WELCOME_MESSAGE, mainKeyboard);
});

// دکمه آپلود HTML
bot.hears('📤 آپلود HTML', async (ctx) => {
  ctx.session = ctx.session || {};
  ctx.session.state = 'waiting_html';
  await ctx.reply('📄 فایل HTML یا متن خود را ارسال کنید:', Markup.forceReply());
});

// دکمه لینک ساب
bot.hears('🔗 لینک ساب', async (ctx) => {
  ctx.session = ctx.session || {};
  ctx.session.state = 'waiting_sub';
  await ctx.reply('🔗 لینک Subscription را ارسال کنید:', Markup.forceReply());
});

// دکمه ارسال دستی
bot.hears('📤 ارسال دستی', async (ctx) => {
  ctx.session = ctx.session || {};
  ctx.session.state = 'waiting_count';
  await ctx.reply('📤 چند کانفیگ ارسال شود؟', Markup.forceReply());
});

// دکمه آمار
bot.hears('📊 آمار', async (ctx) => {
  const { configDb } = await import('../db');
  const stats = configDb.getStats();
  const { buildStatsMessage } = await import('../utils/remark');
  await ctx.reply(buildStatsMessage(stats));
});

// دکمه تنظیمات
bot.hears('⚙️ تنظیمات', async (ctx) => {
  const settings = `⚙️ تنظیمات ربات

━━━━━━━━━━━━━━━━━
📢 کانال مقصد: ${CHANNEL_ID}

🏷️ ریمارک پیش‌فرض:
   @${BOT_USERNAME}_XX

🌍 فیلتر کشور:
   ❌ غیرفعال

📱 فیلتر پروتکل:
   ❌ غیرفعال

━━━━━━━━━━━━━━━━━
برای تغییر با ادمین تماس بگیرید.`;
  await ctx.reply(settings);
});

// دکمه پاک کردن
bot.hears('🗑️ پاک کردن', async (ctx) => {
  const { configDb } = await import('../db');
  configDb.clearAll();
  await ctx.reply('🗑️ همه کانفیگ‌ها پاک شدند.');
});

// هندلر برای پیام‌های متنی (شامل حالت‌های مختلف)
bot.on('text', async (ctx) => {
  const session = ctx.session || {};
  const text = ctx.message.text;

  // اگر در حالت انتظار نیست
  if (!session.state) {
    // بررسی اگر متن حاوی کانفیگ است
    if (text.includes('://')) {
      await processConfigText(ctx, text, 'text');
      return;
    }
    
    // پاسخ پیش‌فرض
    await ctx.reply('دستور نامعتبر. از کیبورد استفاده کنید.', mainKeyboard);
    return;
  }

  // حالت‌های مختلف
  switch (session.state) {
    case 'waiting_html':
      ctx.session.state = undefined;
      await processConfigText(ctx, text, 'html');
      break;
      
    case 'waiting_sub':
      ctx.session.state = undefined;
      if (text.startsWith('http://') || text.startsWith('https://')) {
        await processSubscription(ctx, text);
      } else {
        await ctx.reply('❌ لینک نامعتبر است. باید با http:// یا https:// شروع شود.');
      }
      break;
      
    case 'waiting_count':
      ctx.session.state = undefined;
      const count = parseInt(text);
      if (isNaN(count) || count <= 0) {
        await ctx.reply('❌ عدد نامعتبر. لطفاً یک عدد مثبت وارد کنید.');
      } else {
        await sendConfigs(ctx, count);
      }
      break;
      
    default:
      await ctx.reply('دستور نامعتبر.', mainKeyboard);
  }
});

// هندلر برای فایل‌ها
bot.on('document', async (ctx) => {
  const document = ctx.message.document;
  
  // بررسی نوع فایل
  const validTypes = ['text/html', 'text/plain', 'application/json', 'text/yaml'];
  const validExtensions = ['.html', '.htm', '.txt', '.json', '.yaml', '.yml'];
  
  const isValidType = validTypes.includes(document.mime_type || '');
  const isValidExtension = validExtensions.some(ext => 
    document.file_name?.toLowerCase().endsWith(ext)
  );
  
  if (!isValidType && !isValidExtension) {
    await ctx.reply('❌ نوع فایل پشتیبانی نمی‌شود.\nفرمت‌های مجاز: HTML, TXT, JSON, YAML');
    return;
  }
  
  await ctx.reply('⏳ در حال پردازش فایل...');
  
  try {
    // دانلود فایل
    const fileLink = await ctx.telegram.getFileLink(document.file_id);
    const response = await fetch(fileLink.href);
    const content = await response.text();
    
    await processConfigText(ctx, content, 'file');
  } catch (error) {
    console.error('Error processing file:', error);
    await ctx.reply('❌ خطا در پردازش فایل.');
  }
});

// تابع پردازش متن کانفیگ
async function processConfigText(ctx: Context, text: string, source: string) {
  await ctx.reply('⏳ در حال پردازش...');
  
  try {
    const { extractConfigs, generateConfigHash } = await import('../parser');
    const { configDb } = await import('../db');
    const { detectCountry } = await import('../utils/geoip');
    const { addRemarkToConfig, buildExtractResultMessage } = await import('../utils/remark');
    
    // دریافت هش‌های موجود
    const existingConfigs = configDb.getAll();
    const existingHashes = new Set(existingConfigs.map(c => c.configHash));
    
    // استخراج کانفیگ‌ها
    const result = await extractConfigs(text, source as 'text' | 'html' | 'sub' | 'file', existingHashes);
    
    // آمار کشورها
    const byCountry: Record<string, number> = {};
    
    // پردازش هر کانفیگ
    for (const config of result.configs) {
      // تشخیص کشور
      const countryInfo = await detectCountry(text, config.server, config.remark);
      
      // تولید هش
      const hash = generateConfigHash(config);
      
      // افزودن ریمارک
      const finalConfig = addRemarkToConfig(config, countryInfo.code);
      const remark = `@${BOT_USERNAME}_${countryInfo.code}`;
      
      // ذخیره در دیتابیس
      configDb.add({
        configHash: hash,
        protocol: config.protocol,
        server: config.server,
        port: config.port,
        countryCode: countryInfo.code,
        countryName: countryInfo.name,
        city: countryInfo.city,
        ping: config.ping,
        rawConfig: config.rawConfig,
        finalConfig,
        remark,
        source,
        sent: false,
      });
      
      // آمار کشور
      byCountry[countryInfo.code] = (byCountry[countryInfo.code] || 0) + 1;
    }
    
    // ارسال نتیجه
    result.byCountry = byCountry;
    await ctx.reply(buildExtractResultMessage(result), mainKeyboard);
    
  } catch (error) {
    console.error('Error processing config:', error);
    await ctx.reply('❌ خطا در پردازش کانفیگ‌ها.', mainKeyboard);
  }
}

// تابع پردازش لینک ساب
async function processSubscription(ctx: Context, url: string) {
  await ctx.reply('⏳ در حال دریافت و پردازش ساب...');
  
  try {
    const { extractConfigs, generateConfigHash } = await import('../parser');
    const { configDb, subscriptionDb } = await import('../db');
    const { detectCountry } = await import('../utils/geoip');
    const { addRemarkToConfig, buildExtractResultMessage } = await import('../utils/remark');
    
    // دریافت هش‌های موجود
    const existingConfigs = configDb.getAll();
    const existingHashes = new Set(existingConfigs.map(c => c.configHash));
    
    // استخراج کانفیگ‌ها
    const result = await extractConfigs(url, 'sub', existingHashes);
    
    // ذخیره ساب
    const sub = subscriptionDb.add(url);
    
    // آمار کشورها
    const byCountry: Record<string, number> = {};
    
    // پردازش هر کانفیگ
    for (const config of result.configs) {
      // تشخیص کشور
      const countryInfo = await detectCountry('', config.server, config.remark);
      
      // تولید هش
      const hash = generateConfigHash(config);
      
      // افزودن ریمارک
      const finalConfig = addRemarkToConfig(config, countryInfo.code);
      const remark = `@${BOT_USERNAME}_${countryInfo.code}`;
      
      // ذخیره در دیتابیس
      configDb.add({
        configHash: hash,
        protocol: config.protocol,
        server: config.server,
        port: config.port,
        countryCode: countryInfo.code,
        countryName: countryInfo.name,
        city: countryInfo.city,
        ping: config.ping,
        rawConfig: config.rawConfig,
        finalConfig,
        remark,
        source: 'sub',
        sourceUrl: url,
        sent: false,
      });
      
      // آمار کشور
      byCountry[countryInfo.code] = (byCountry[countryInfo.code] || 0) + 1;
    }
    
    // آپدیت تعداد کانفیگ ساب
    subscriptionDb.updateLastCheck(sub.id, result.new);
    
    // ارسال نتیجه
    result.byCountry = byCountry;
    await ctx.reply(buildExtractResultMessage(result), mainKeyboard);
    
  } catch (error) {
    console.error('Error processing subscription:', error);
    await ctx.reply('❌ خطا در دریافت یا پردازش ساب.', mainKeyboard);
  }
}

// تابع ارسال کانفیگ‌ها به کانال
async function sendConfigs(ctx: Context, count: number) {
  await ctx.reply('⏳ در حال ارسال...');
  
  try {
    const { configDb } = await import('../db');
    const { COUNTRIES } = await import('../parser/types');
    const { buildChannelPost, generateDisplayPing } = await import('../utils/remark');
    
    // دریافت کانفیگ‌های در صف
    const configs = configDb.getQueued(count);
    
    if (configs.length === 0) {
      await ctx.reply('📭 کانفیگی در صف انتظار نیست.', mainKeyboard);
      return;
    }
    
    const stats = {
      sent: 0,
      byCountry: {} as Record<string, number>,
    };
    
    // ارسال هر کانفیگ
    for (const config of configs) {
      try {
        // پینگ
        const ping = config.ping || generateDisplayPing();
        
        // اطلاعات کشور
        const countryInfo = {
          code: config.countryCode || 'XX',
          name: config.countryName || 'نامشخص',
          flag: COUNTRIES[config.countryCode || '']?.flag || '🌍',
        };
        
        // ساخت پست
        const post = buildChannelPost({
          countryInfo,
          ping,
          config: config.finalConfig,
          protocol: config.protocol,
          remark: config.remark || '',
        });
        
        // ارسال به کانال
        const message = await ctx.telegram.sendMessage(CHANNEL_ID, post, {
          parse_mode: 'HTML',
        });
        
        // علامت‌گذاری به عنوان ارسال شده
        configDb.markSent(config.id, message.message_id.toString());
        
        // آمار
        stats.sent++;
        stats.byCountry[config.countryCode || 'XX'] = (stats.byCountry[config.countryCode || 'XX'] || 0) + 1;
        
        // تاخیر بین ارسال‌ها
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('Error sending config:', error);
      }
    }
    
    // پیام آمار
    let statsMessage = `✅ ارسال انجام شد

━━━━━━━━━━━━━━━━━
📊 آمار این ارسال:
   • ارسال شده: ${stats.sent.toLocaleString('fa-IR')}
   • باقی‌مانده در صف: ${configDb.getStats().inQueue.toLocaleString('fa-IR')}`;
    
    if (Object.keys(stats.byCountry).length > 0) {
      statsMessage += `\n
━━━━━━━━━━━━━━━━━
📍 کشورها:`;
      for (const [code, count] of Object.entries(stats.byCountry)) {
        const info = COUNTRIES[code];
        statsMessage += `\n   ${info?.flag || '🌍'} ${info?.nameFa || code}: ${count.toLocaleString('fa-IR')}`;
      }
    }
    
    await ctx.reply(statsMessage, mainKeyboard);
    
  } catch (error) {
    console.error('Error sending configs:', error);
    await ctx.reply('❌ خطا در ارسال کانفیگ‌ها.', mainKeyboard);
  }
}

// هندلر خطا
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ خطایی رخ داد. لطفاً دوباره تلاش کنید.');
});

// صادر کردن ربات
export default bot;
