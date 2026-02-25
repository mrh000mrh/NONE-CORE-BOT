// پارسر SSR (ShadowsocksR)
import { ParsedConfig } from './types';

export function parseSsr(config: string): ParsedConfig | null {
  try {
    // ssr://base64encoded
    const base64Part = config.replace('ssr://', '');
    const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
    
    // فرمت: server:port:protocol:method:obfs:password_base64/?params
    const parts = decoded.split('/?');
    const mainPart = parts[0];
    const paramsPart = parts[1] || '';
    
    const mainParts = mainPart.split(':');
    if (mainParts.length < 6) {
      return null;
    }
    
    const server = mainParts[0];
    const port = parseInt(mainParts[1]) || 8388;
    const protocol = mainParts[2];
    const method = mainParts[3];
    const obfs = mainParts[4];
    const password = Buffer.from(mainParts[5], 'base64').toString('utf-8');
    
    // پارامترها
    let remark: string | undefined;
    if (paramsPart) {
      const params = new URLSearchParams(paramsPart);
      remark = params.get('remarks') ? 
        Buffer.from(params.get('remarks')!, 'base64').toString('utf-8') : undefined;
    }
    
    return {
      protocol: 'ssr',
      server,
      port,
      password,
      method,
      network: obfs,
      remark,
      rawConfig: config,
    };
  } catch (error) {
    console.error('Error parsing SSR:', error);
    return null;
  }
}

// ساخت کانفیگ SSR با ریمارک جدید
export function buildSsr(config: ParsedConfig, newRemark: string): string {
  const passwordBase64 = Buffer.from(config.password || '').toString('base64');
  const remarkBase64 = Buffer.from(newRemark).toString('base64');
  
  const mainPart = `${config.server}:${config.port}:${config.method}:${config.method}:plain:${passwordBase64}`;
  const params = `/?remarks=${remarkBase64}`;
  
  const full = mainPart + params;
  const encoded = Buffer.from(full).toString('base64');
  
  return `ssr://${encoded}`;
}
