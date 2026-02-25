// پارسر Trojan
import { ParsedConfig } from './types';

export function parseTrojan(config: string): ParsedConfig | null {
  try {
    // trojan://password@server:port?params#remark
    const url = new URL(config);
    
    const password = url.username;
    const server = url.hostname;
    const port = parseInt(url.port) || 443;
    
    // پارامترهای query
    const params = url.searchParams;
    const security = params.get('security') || 'tls';
    const type = params.get('type') || 'tcp';
    const network = type;
    const host = params.get('host') || server;
    const path = params.get('path') || undefined;
    const sni = params.get('sni') || host;
    const alpn = params.get('alpn') || undefined;
    
    // ریمارک (از fragment)
    let remark = url.hash ? decodeURIComponent(url.hash.slice(1)) : undefined;
    
    return {
      protocol: 'trojan',
      server,
      port,
      password,
      network,
      security,
      type,
      host,
      path,
      sni,
      alpn,
      remark,
      rawConfig: config,
    };
  } catch (error) {
    console.error('Error parsing Trojan:', error);
    return null;
  }
}

// ساخت کانفیگ Trojan با ریمارک جدید
export function buildTrojan(config: ParsedConfig, newRemark: string): string {
  const params = new URLSearchParams();
  
  if (config.security) {
    params.set('security', config.security);
  }
  if (config.network && config.network !== 'tcp') {
    params.set('type', config.network);
  }
  if (config.host) {
    params.set('host', config.host);
  }
  if (config.path) {
    params.set('path', config.path);
  }
  if (config.sni) {
    params.set('sni', config.sni);
  }
  if (config.alpn) {
    params.set('alpn', config.alpn);
  }
  
  const queryString = params.toString();
  const remarkEncoded = encodeURIComponent(newRemark);
  
  let url = `trojan://${config.password}@${config.server}:${config.port}`;
  if (queryString) {
    url += `?${queryString}`;
  }
  url += `#${remarkEncoded}`;
  
  return url;
}
