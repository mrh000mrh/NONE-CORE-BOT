// پارسر Hysteria2
import { ParsedConfig } from './types';

export function parseHysteria2(config: string): ParsedConfig | null {
  try {
    // hysteria2://password@server:port?params#remark
    // hy2://password@server:port?params#remark
    const url = new URL(config);
    
    const password = url.username;
    const server = url.hostname;
    const port = parseInt(url.port) || 443;
    
    // پارامترهای query
    const params = url.searchParams;
    const sni = params.get('sni') || server;
    const alpn = params.get('alpn') || undefined;
    const insecure = params.get('insecure') === '1';
    
    // ریمارک
    let remark = url.hash ? decodeURIComponent(url.hash.slice(1)) : undefined;
    
    return {
      protocol: 'hysteria2',
      server,
      port,
      password,
      network: 'udp',
      security: insecure ? 'none' : 'tls',
      sni,
      alpn,
      remark,
      rawConfig: config,
    };
  } catch (error) {
    console.error('Error parsing Hysteria2:', error);
    return null;
  }
}

// ساخت کانفیگ Hysteria2 با ریمارک جدید
export function buildHysteria2(config: ParsedConfig, newRemark: string): string {
  const params = new URLSearchParams();
  
  if (config.sni) {
    params.set('sni', config.sni);
  }
  if (config.alpn) {
    params.set('alpn', config.alpn);
  }
  
  const remarkEncoded = encodeURIComponent(newRemark);
  const queryString = params.toString();
  
  let url = `hysteria2://${config.password}@${config.server}:${config.port}`;
  if (queryString) {
    url += `?${queryString}`;
  }
  url += `#${remarkEncoded}`;
  
  return url;
}
