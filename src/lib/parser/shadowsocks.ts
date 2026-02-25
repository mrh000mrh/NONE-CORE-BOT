// پارسر Shadowsocks
import { ParsedConfig } from './types';

export function parseShadowsocks(config: string): ParsedConfig | null {
  try {
    // ss://base64@server:port#remark
    // یا ss://base64#remark (سرور در base64)
    // یا ss://method:password@server:port#remark
    
    const url = new URL(config);
    let method: string;
    let password: string;
    let server: string;
    let port: number;
    let remark: string | undefined;
    
    // ریمارک از fragment
    remark = url.hash ? decodeURIComponent(url.hash.slice(1)) : undefined;
    
    // بررسی فرمت
    const authPart = url.username;
    
    if (url.password) {
      // فرمت: ss://method:password@server:port
      method = authPart;
      password = url.password;
      server = url.hostname;
      port = parseInt(url.port) || 8388;
    } else {
      // فرمت: ss://base64@server:port یا ss://base64#remark
      try {
        const decoded = Buffer.from(authPart, 'base64').toString('utf-8');
        const parts = decoded.split(':');
        if (parts.length >= 2) {
          method = parts[0];
          password = parts.slice(1).join(':');
          server = url.hostname || '0.0.0.0';
          port = parseInt(url.port) || 8388;
        } else {
          // فرمت ساده‌تر
          method = 'aes-256-gcm';
          password = authPart;
          server = url.hostname || '0.0.0.0';
          port = parseInt(url.port) || 8388;
        }
      } catch {
        // اگر decode نشد
        method = 'aes-256-gcm';
        password = authPart;
        server = url.hostname || '0.0.0.0';
        port = parseInt(url.port) || 8388;
      }
    }
    
    return {
      protocol: 'ss',
      server,
      port,
      password,
      method,
      remark,
      rawConfig: config,
    };
  } catch (error) {
    console.error('Error parsing Shadowsocks:', error);
    return null;
  }
}

// ساخت کانفیگ Shadowsocks با ریمارک جدید
export function buildShadowsocks(config: ParsedConfig, newRemark: string): string {
  const auth = Buffer.from(`${config.method}:${config.password}`).toString('base64');
  const remarkEncoded = encodeURIComponent(newRemark);
  return `ss://${auth}@${config.server}:${config.port}#${remarkEncoded}`;
}
