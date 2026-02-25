// Simple JSON-based database for Config Bot
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'bot-db.json');

// تایپ‌های دیتابیس
export interface Config {
  id: string;
  configHash: string;
  protocol: string;
  server: string;
  port: number;
  countryCode?: string;
  countryName?: string;
  city?: string;
  ping?: number;
  quality?: string;
  rawConfig: string;
  finalConfig: string;
  remark?: string;
  source: string;
  sourceUrl?: string;
  sent: boolean;
  sentAt?: string;
  messageId?: string;
  createdAt: string;
  expiresAt: string;
}

export interface Subscription {
  id: string;
  url: string;
  name?: string;
  lastCheck?: string;
  configCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  totalConfigs: number;
  sentToday: number;
  inQueue: number;
  duplicatesRemoved: number;
  lastReset: string;
}

export interface Database {
  configs: Config[];
  subscriptions: Subscription[];
  stats: Stats;
}

// ساختار پیش‌فرض دیتابیس
const defaultDb: Database = {
  configs: [],
  subscriptions: [],
  stats: {
    totalConfigs: 0,
    sentToday: 0,
    inQueue: 0,
    duplicatesRemoved: 0,
    lastReset: new Date().toISOString().split('T')[0],
  },
};

// خواندن دیتابیس
export function readDb(): Database {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // ایجاد پوشه و فایل دیتابیس
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2));
      return defaultDb;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return defaultDb;
  }
}

// نوشتن در دیتابیس
export function writeDb(data: Database): void {
  try {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
  }
}

// توابع کمکی برای کانفیگ‌ها
export const configDb = {
  // افزودن کانفیگ جدید
  add: (config: Omit<Config, 'id' | 'createdAt' | 'expiresAt'>): Config => {
    const db = readDb();
    const newConfig: Config = {
      ...config,
      id: generateId(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // ۱۰ روز
    };
    db.configs.push(newConfig);
    db.stats.totalConfigs = countUniqueConfigs(db.configs);
    db.stats.inQueue = db.configs.filter(c => !c.sent).length;
    writeDb(db);
    return newConfig;
  },

  // بررسی وجود کانفیگ (با هش یا IP)
  exists: (configHash: string, server?: string): boolean => {
    const db = readDb();
    return db.configs.some(c => 
      c.configHash === configHash || 
      (server && c.server === server && !c.sent)
    );
  },

  // دریافت کانفیگ‌های در صف
  getQueued: (limit?: number): Config[] => {
    const db = readDb();
    const queued = db.configs
      .filter(c => !c.sent)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return limit ? queued.slice(0, limit) : queued;
  },

  // علامت‌گذاری به عنوان ارسال شده
  markSent: (id: string, messageId: string): void => {
    const db = readDb();
    const config = db.configs.find(c => c.id === id);
    if (config) {
      config.sent = true;
      config.sentAt = new Date().toISOString();
      config.messageId = messageId;
      db.stats.sentToday++;
      db.stats.inQueue = db.configs.filter(c => !c.sent).length;
      writeDb(db);
    }
  },

  // حذف کانفیگ‌های منقضی
  cleanupExpired: (): number => {
    const db = readDb();
    const now = new Date();
    const initialLength = db.configs.length;
    db.configs = db.configs.filter(c => new Date(c.expiresAt) > now);
    const removed = initialLength - db.configs.length;
    if (removed > 0) {
      db.stats.duplicatesRemoved += removed;
      writeDb(db);
    }
    return removed;
  },

  // دریافت آمار
  getStats: (): Stats & { byCountry: Record<string, number>; byProtocol: Record<string, number> } => {
    const db = readDb();
    
    // ریست آمار روزانه اگر روز جدید است
    const today = new Date().toISOString().split('T')[0];
    if (db.stats.lastReset !== today) {
      db.stats.sentToday = 0;
      db.stats.lastReset = today;
      writeDb(db);
    }

    const byCountry: Record<string, number> = {};
    const byProtocol: Record<string, number> = {};

    db.configs.forEach(c => {
      if (c.countryCode) {
        byCountry[c.countryCode] = (byCountry[c.countryCode] || 0) + 1;
      }
      byProtocol[c.protocol] = (byProtocol[c.protocol] || 0) + 1;
    });

    return {
      ...db.stats,
      byCountry,
      byProtocol,
    };
  },

  // پاک کردن همه کانفیگ‌ها
  clearAll: (): void => {
    const db = readDb();
    db.configs = [];
    db.stats = {
      totalConfigs: 0,
      sentToday: 0,
      inQueue: 0,
      duplicatesRemoved: 0,
      lastReset: new Date().toISOString().split('T')[0],
    };
    writeDb(db);
  },

  // دریافت همه کانفیگ‌ها
  getAll: (): Config[] => {
    const db = readDb();
    return db.configs;
  },
};

// توابع کمکی برای ساب‌سکریپشن
export const subscriptionDb = {
  add: (url: string, name?: string): Subscription => {
    const db = readDb();
    const sub: Subscription = {
      id: generateId(),
      url,
      name,
      configCount: 0,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.subscriptions.push(sub);
    writeDb(db);
    return sub;
  },

  getAll: (): Subscription[] => {
    const db = readDb();
    return db.subscriptions.filter(s => s.active);
  },

  updateLastCheck: (id: string, configCount: number): void => {
    const db = readDb();
    const sub = db.subscriptions.find(s => s.id === id);
    if (sub) {
      sub.lastCheck = new Date().toISOString();
      sub.configCount = configCount;
      sub.updatedAt = new Date().toISOString();
      writeDb(db);
    }
  },

  remove: (id: string): void => {
    const db = readDb();
    const sub = db.subscriptions.find(s => s.id === id);
    if (sub) {
      sub.active = false;
      sub.updatedAt = new Date().toISOString();
      writeDb(db);
    }
  },
};

// تولید ID یکتا
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// شمارش کانفیگ‌های منحصربه‌فرد
function countUniqueConfigs(configs: Config[]): number {
  const uniqueHashes = new Set(configs.map(c => c.configHash));
  return uniqueHashes.size;
}

const dbExports = { configDb, subscriptionDb, readDb, writeDb };
export default dbExports;
