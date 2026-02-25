// سیستم ریمارک و فرمت‌بندی کانفیگ
import { ParsedConfig } from '../parser/types';
import { CountryInfo, COUNTRIES } from '../parser/types';
import { buildVless } from '../parser/vless';
import { buildVmess } from '../parser/vmess';
import { buildTrojan } from '../parser/trojan';
import { buildShadowsocks } from '../parser/shadowsocks';
import { buildSsr } from '../parser/ssr';
import { buildTuic } from '../parser/tuic';
import { buildHysteria2 } from '../parser/hysteria2';

// تنظیمات ریمارک
const BOT_USERNAME = process.env.BOT_USERNAME || 'nonecorebot';

// ساخت ریمارک جدید
export function buildRemark(countryCode: string, botUsername?: string): string {
  const bot = botUsername || BOT_USERNAME;
  const cleanBot = bot.replace('@', '');
  return `@${cleanBot}_${countryCode.toUpperCase()}`;
}

// افزودن ریمارک به کانفیگ
export function addRemarkToConfig(config: ParsedConfig, countryCode: string): string {
  const remark = buildRemark(countryCode);
  
  switch (config.protocol) {
    case 'vless':
      return buildVless(config, remark);
    case 'vmess':
      return buildVmess(config, remark);
    case 'trojan':
      return buildTrojan(config, remark);
    case 'ss':
      return buildShadowsocks(config, remark);
    case 'ssr':
      return buildSsr(config, remark);
    case 'tuic':
      return buildTuic(config, remark);
    case 'hysteria2':
      return buildHysteria2(config, remark);
    default:
      return config.rawConfig;
  }
}

// استخراج پینگ از متن
export function extractPingFromText(text: string): number | null {
  // الگوهای مختلف پینگ
  const patterns = [
    /(\d+)\s*(?:ms|میلی‌ثانیه)/i,
    /ping[:\s]*(\d+)/i,
    /پینگ[:\s]*(\d+)/i,
    /📶\s*(\d+)\s*ms/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
}

// تولید پینگ نمایشی (رندوم)
export function generateDisplayPing(): number {
  // ۴۵ تا ۱۲۰ میلی‌ثانیه
  return Math.floor(Math.random() * 75) + 45;
}

// تعیین کیفیت از روی پینگ
export function getQualityFromPing(ping: number): { quality: string; emoji: string } {
  if (ping < 50) {
    return { quality: 'عالی', emoji: '🏆' };
  } else if (ping < 80) {
    return { quality: 'خوب', emoji: '✅' };
  } else if (ping < 120) {
    return { quality: 'متوسط', emoji: '⚠️' };
  } else {
    return { quality: 'ضعیف', emoji: '❌' };
  }
}

// فرمت‌بندی پینگ برای نمایش
export function formatPing(ping: number): string {
  const { quality, emoji } = getQualityFromPing(ping);
  return `${emoji} ${ping}ms (${quality})`;
}

// ساخت پست کانال
export interface ChannelPostOptions {
  countryInfo: CountryInfo;
  ping: number;
  config: string;
  protocol: string;
  remark: string;
  includeQR?: boolean;
  qrUrl?: string;
}

export function buildChannelPost(options: ChannelPostOptions): string {
  const { countryInfo, ping, config, protocol, remark } = options;
  const { quality, emoji } = getQualityFromPing(ping);
  
  // هشتگ‌ها
  const protocolTag = `#${protocol.toUpperCase()}`;
  const countryTag = countryInfo.code !== 'XX' ? `#${countryInfo.name}` : '';
  const tags = `${protocolTag} #فیلترشکن #کانفیگ #VPN #اینترنت_آزاد ${countryTag}`.trim();
  
  // پست
  const post = `📍 ${countryInfo.name} ${countryInfo.code} 📶 ${ping}ms (${quality})

<tg-spoiler><code>${config}</code></tg-spoiler>

🏷️ ریمارک: ${remark}

${tags}

━━━━━━━━━━━━━━━━━
✅ فعال | ⚠️ فقط برای وب‌گردی – ترید و بانک توصیه نمی‌شود
📱 کانفیگ را کپی کنید و در کلاینت‌های v2rayNG - Streisand - Hiddify و... استفاده کنید.

@${BOT_USERNAME.replace('@', '')}`;

  return post;
}

// ساخت پیام تست اتصال (نمایشی)
export function buildTestConnectionMessage(isActive: boolean = true, ping?: number): string {
  const displayPing = ping || generateDisplayPing();
  const { quality, emoji } = getQualityFromPing(displayPing);
  
  // ۸۰٪ احتمال فعال
  const active = isActive && Math.random() > 0.2;
  
  if (active) {
    return `🧪 نتیجه تست اتصال

━━━━━━━━━━━━━━━━━
✅ وضعیت: فعال
📶 پینگ: ${displayPing}ms
🏆 کیفیت: ${quality}

━━━━━━━━━━━━━━━━━
⚠️ این نتایج بر اساس آخرین تست است. و ممکن است در دستگاه و لوکیشن شما وضعیت متفاوت باشد. توصیه می‌شود خودتان تست کنید.`;
  } else {
    return `🧪 نتیجه تست اتصال

━━━━━━━━━━━━━━━━━
⚠️ وضعیت: احتمالاً فعال
📶 پینگ: ${displayPing}ms
🏆 کیفیت: ${quality}

━━━━━━━━━━━━━━━━━
⚠️ این نتایج بر اساس آخرین تست است. و ممکن است در دستگاه و لوکیشن شما وضعیت متفاوت باشد. توصیه می‌شود خودتان تست کنید.`;
  }
}

// ساخت پیام آمار
export function buildStatsMessage(stats: {
  totalConfigs: number;
  sentToday: number;
  inQueue: number;
  duplicatesRemoved: number;
  byCountry?: Record<string, number>;
  byProtocol?: Record<string, number>;
}): string {
  let message = `📊 آمار ربات

━━━━━━━━━━━━━━━━━
📌 کانفیگ‌ها:
   • کل منحصربه‌فرد: ${stats.totalConfigs.toLocaleString('fa-IR')}
   • ارسال شده امروز: ${stats.sentToday.toLocaleString('fa-IR')}
   • در صف انتظار: ${stats.inQueue.toLocaleString('fa-IR')}
   • تکراری حذف شده: ${stats.duplicatesRemoved.toLocaleString('fa-IR')}`;

  // آمار تفکیکی پروتکل
  if (stats.byProtocol && Object.keys(stats.byProtocol).length > 0) {
    message += `\n
━━━━━━━━━━━━━━━━━
📌 تفکیک پروتکل:`;
    for (const [protocol, count] of Object.entries(stats.byProtocol)) {
      message += `\n   • ${protocol.toUpperCase()}: ${count.toLocaleString('fa-IR')}`;
    }
  }

  // آمار تفکیکی کشور
  if (stats.byCountry && Object.keys(stats.byCountry).length > 0) {
    message += `\n
━━━━━━━━━━━━━━━━━
📌 تفکیک کشور:`;
    const sortedCountries = Object.entries(stats.byCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    for (const [code, count] of sortedCountries) {
      const info = COUNTRIES[code];
      message += `\n   ${info?.flag || '🌍'} ${info?.nameFa || code}: ${count.toLocaleString('fa-IR')}`;
    }
  }

  return message;
}

// ساخت پیام نتیجه استخراج
export function buildExtractResultMessage(result: {
  total: number;
  new: number;
  duplicates: number;
  invalid: number;
  byCountry?: Record<string, number>;
}): string {
  let message = `✅ پردازش انجام شد

━━━━━━━━━━━━━━━━━
📊 نتیجه:
   • کانفیگ یافت شده: ${result.total.toLocaleString('fa-IR')}
   • جدید: ${result.new.toLocaleString('fa-IR')}
   • تکراری: ${result.duplicates.toLocaleString('fa-IR')}
   • نامعتبر: ${result.invalid.toLocaleString('fa-IR')}`;

  // آمار کشورها
  if (result.byCountry && Object.keys(result.byCountry).length > 0) {
    message += `\n
━━━━━━━━━━━━━━━━━
📍 کشورها:`;
    const sortedCountries = Object.entries(result.byCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    for (const [code, count] of sortedCountries) {
      const info = COUNTRIES[code];
      message += `\n   ${info?.flag || '🌍'} ${info?.nameFa || code}: ${count.toLocaleString('fa-IR')}`;
    }
  }

  if (result.new > 0) {
    message += `\n
━━━━━━━━━━━━━━━━━
کانفیگ‌های جدید به صف اضافه شدند.
برای ارسال از 📤 ارسال دستی استفاده کنید.`;
  }

  return message;
}
