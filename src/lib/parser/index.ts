// پارسر اصلی کانفیگ‌ها
import { createHash } from 'crypto';
import { ParsedConfig, ExtractResult, Protocol } from './types';
import { parseVless } from './vless';
import { parseVmess } from './vmess';
import { parseTrojan } from './trojan';
import { parseShadowsocks } from './shadowsocks';
import { parseSsr } from './ssr';
import { parseTuic } from './tuic';
import { parseHysteria2 } from './hysteria2';

// دیکد Base64
function base64Decode(str: string): string {
  try {
    // اضافه کردن padding اگر لازم باشد
    const padding = str.length % 4;
    if (padding) {
      str += '='.repeat(4 - padding);
    }
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return str;
  }
}

// تشخیص نوع کانفیگ از روی پیشوند
function detectProtocol(config: string): Protocol | null {
  const trimmed = config.trim().toLowerCase();
  
  if (trimmed.startsWith('vless://')) return 'vless';
  if (trimmed.startsWith('vmess://')) return 'vmess';
  if (trimmed.startsWith('trojan://')) return 'trojan';
  if (trimmed.startsWith('ss://')) return 'ss';
  if (trimmed.startsWith('ssr://')) return 'ssr';
  if (trimmed.startsWith('tuic://')) return 'tuic';
  if (trimmed.startsWith('hysteria2://') || trimmed.startsWith('hy2://')) return 'hysteria2';
  
  return null;
}

// تولید هش یکتا برای کانفیگ
export function generateConfigHash(config: ParsedConfig): string {
  const data = `${config.protocol}:${config.server}:${config.port}:${config.uuid || config.password || ''}`;
  return createHash('md5').update(data).digest('hex');
}

// پارس یک کانفیگ تکی
export function parseSingleConfig(rawConfig: string): ParsedConfig | null {
  const protocol = detectProtocol(rawConfig);
  if (!protocol) return null;

  try {
    switch (protocol) {
      case 'vless':
        return parseVless(rawConfig);
      case 'vmess':
        return parseVmess(rawConfig);
      case 'trojan':
        return parseTrojan(rawConfig);
      case 'ss':
        return parseShadowsocks(rawConfig);
      case 'ssr':
        return parseSsr(rawConfig);
      case 'tuic':
        return parseTuic(rawConfig);
      case 'hysteria2':
        return parseHysteria2(rawConfig);
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error parsing ${protocol} config:`, error);
    return null;
  }
}

// استخراج کانفیگ‌ها از متن
export function extractFromText(text: string): ParsedConfig[] {
  const configs: ParsedConfig[] = [];
  
  // الگوهای مختلف کانفیگ
  const patterns = [
    // VLESS
    /vless:\/\/[^\s<>"']+/gi,
    // VMess
    /vmess:\/\/[A-Za-z0-9+/=]+/gi,
    // Trojan
    /trojan:\/\/[^\s<>"']+/gi,
    // Shadowsocks
    /ss:\/\/[^\s<>"']+/gi,
    // SSR
    /ssr:\/\/[A-Za-z0-9+/=]+/gi,
    // TUIC
    /tuic:\/\/[^\s<>"']+/gi,
    // Hysteria2
    /hysteria2:\/\/[^\s<>"']+/gi,
    /hy2:\/\/[^\s<>"']+/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const parsed = parseSingleConfig(match);
        if (parsed) {
          configs.push(parsed);
        }
      }
    }
  }

  return configs;
}

// استخراج از HTML
export function extractFromHtml(html: string): ParsedConfig[] {
  // حذف تگ‌های HTML و استخراج متن
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  // همچنین بررسی href و src برای لینک‌های کانفیگ
  const linkPatterns = [
    /href=["'](vless:\/\/[^"']+)["']/gi,
    /href=["'](vmess:\/\/[^"']+)["']/gi,
    /href=["'](trojan:\/\/[^"']+)["']/gi,
    /href=["'](ss:\/\/[^"']+)["']/gi,
    /href=["'](ssr:\/\/[^"']+)["']/gi,
    /href=["'](tuic:\/\/[^"']+)["']/gi,
    /href=["'](hysteria2:\/\/[^"']+)["']/gi,
    /href=["'](hy2:\/\/[^"']+)["']/gi,
  ];

  let configs = extractFromText(text);

  // استخراج از لینک‌ها
  for (const pattern of linkPatterns) {
    const matches = html.match(pattern);
    if (matches) {
      for (const match of matches) {
        const urlMatch = match.match(/href=["']([^"']+)["']/i);
        if (urlMatch && urlMatch[1]) {
          const parsed = parseSingleConfig(urlMatch[1]);
          if (parsed) {
            configs.push(parsed);
          }
        }
      }
    }
  }

  return configs;
}

// استخراج از لینک ساب‌سکریپشن
export async function extractFromSubscription(url: string): Promise<ParsedConfig[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let content = await response.text();
    
    // تلاش برای دیکد Base64
    try {
      const decoded = base64Decode(content.trim());
      if (decoded.includes('://')) {
        content = decoded;
      }
    } catch {
      // اگر دیکد نشد، همان محتوا را استفاده کن
    }

    // بررسی فرمت YAML/Clash
    if (content.includes('proxies:') || content.includes('proxy-groups:')) {
      return extractFromYaml(content);
    }

    // بررسی فرمت JSON
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      return extractFromJson(content);
    }

    // استخراج از متن ساده
    return extractFromText(content);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return [];
  }
}

// استخراج از YAML (Clash)
function extractFromYaml(yaml: string): ParsedConfig[] {
  const configs: ParsedConfig[] = [];
  
  // الگوی پیدا کردن پروکسی‌ها در YAML
  const proxyPattern = /-\s*(?:name|Names):\s*["']?([^"'\n]+)["']?\s*\n((?:[ \t]+[a-z]+:[^\n]+\n?)+)/gi;
  
  let match;
  while ((match = proxyPattern.exec(yaml)) !== null) {
    const proxyBlock = match[2];
    const typeMatch = proxyBlock.match(/type:\s*["']?(\w+)["']?/i);
    
    if (typeMatch) {
      const type = typeMatch[1].toLowerCase();
      // تبدیل فرمت Clash به فرمت استاندارد
      const serverMatch = proxyBlock.match(/server:\s*["']?([^"'\n]+)["']?/i);
      const portMatch = proxyBlock.match(/port:\s*(\d+)/i);
      const uuidMatch = proxyBlock.match(/uuid:\s*["']?([^"'\n]+)["']?/i);
      const passwordMatch = proxyBlock.match(/password:\s*["']?([^"'\n]+)["']?/i);
      const methodMatch = proxyBlock.match(/cipher:\s*["']?([^"'\n]+)["']?/i);
      
      if (serverMatch && portMatch) {
        const server = serverMatch[1];
        const port = parseInt(portMatch[1]);
        
        let configString = '';
        switch (type) {
          case 'vless':
            configString = `vless://${uuidMatch?.[1] || ''}@${server}:${port}`;
            break;
          case 'vmess':
            const vmessObj = {
              v: '2',
              ps: match[1],
              add: server,
              port: port.toString(),
              id: uuidMatch?.[1] || '',
              scy: 'auto',
              net: 'tcp',
              type: 'none',
            };
            configString = `vmess://${Buffer.from(JSON.stringify(vmessObj)).toString('base64')}`;
            break;
          case 'trojan':
            configString = `trojan://${passwordMatch?.[1] || ''}@${server}:${port}`;
            break;
          case 'ss':
            configString = `ss://${methodMatch?.[1] || 'aes-256-gcm'}:${passwordMatch?.[1] || ''}@${server}:${port}`;
            break;
        }
        
        if (configString) {
          const parsed = parseSingleConfig(configString);
          if (parsed) {
            parsed.remark = match[1];
            configs.push(parsed);
          }
        }
      }
    }
  }
  
  // همچنین استخراج از لینک‌های موجود در YAML
  const linkConfigs = extractFromText(yaml);
  configs.push(...linkConfigs);
  
  return configs;
}

// استخراج از JSON (SingBox, etc.)
function extractFromJson(json: string): ParsedConfig[] {
  const configs: ParsedConfig[] = [];
  
  try {
    const data = JSON.parse(json);
    
    // فرمت SingBox
    if (data.outbounds && Array.isArray(data.outbounds)) {
      for (const outbound of data.outbounds) {
        if (outbound.server && outbound.server_port) {
          let configString = '';
          switch (outbound.type) {
            case 'vless':
              configString = `vless://${outbound.uuid}@${outbound.server}:${outbound.server_port}`;
              break;
            case 'vmess':
              const vmessObj = {
                v: '2',
                ps: outbound.tag || '',
                add: outbound.server,
                port: outbound.server_port.toString(),
                id: outbound.uuid || '',
                scy: 'auto',
                net: outbound.transport?.type || 'tcp',
              };
              configString = `vmess://${Buffer.from(JSON.stringify(vmessObj)).toString('base64')}`;
              break;
            case 'trojan':
              configString = `trojan://${outbound.password}@${outbound.server}:${outbound.server_port}`;
              break;
            case 'shadowsocks':
              configString = `ss://${outbound.method}:${outbound.password}@${outbound.server}:${outbound.server_port}`;
              break;
          }
          
          if (configString) {
            const parsed = parseSingleConfig(configString);
            if (parsed) {
              parsed.remark = outbound.tag;
              configs.push(parsed);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
  
  return configs;
}

// تابع اصلی استخراج
export async function extractConfigs(
  input: string,
  source: 'text' | 'html' | 'sub' | 'file' = 'text',
  existingHashes: Set<string>
): Promise<ExtractResult> {
  let configs: ParsedConfig[] = [];
  
  switch (source) {
    case 'html':
      configs = extractFromHtml(input);
      break;
    case 'sub':
      configs = await extractFromSubscription(input);
      break;
    case 'text':
    case 'file':
    default:
      // تشخیص خودکار نوع ورودی
      if (input.includes('<') && input.includes('>')) {
        configs = extractFromHtml(input);
      } else if (input.startsWith('http://') || input.startsWith('https://')) {
        configs = await extractFromSubscription(input);
      } else {
        configs = extractFromText(input);
      }
      break;
  }

  // فیلتر کردن تکراری‌ها
  const uniqueConfigs: ParsedConfig[] = [];
  let duplicates = 0;
  let invalid = 0;

  for (const config of configs) {
    if (!config.server || !config.port) {
      invalid++;
      continue;
    }

    const hash = generateConfigHash(config);
    if (existingHashes.has(hash)) {
      duplicates++;
      continue;
    }

    uniqueConfigs.push(config);
    existingHashes.add(hash);
  }

  return {
    configs: uniqueConfigs,
    total: configs.length,
    new: uniqueConfigs.length,
    duplicates,
    invalid,
    source,
  };
}

export { generateConfigHash };
