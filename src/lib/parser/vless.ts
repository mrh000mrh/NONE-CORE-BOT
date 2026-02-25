// پارسر VLESS
import { ParsedConfig } from './types';

export function parseVless(config: string): ParsedConfig | null {
  try {
    // vless://uuid@server:port?params#remark
    const url = new URL(config);
    
    const uuid = url.username;
    const server = url.hostname;
    const port = parseInt(url.port) || 443;
    
    // پارامترهای query
    const params = url.searchParams;
    const encryption = params.get('encryption') || 'none';
    const security = params.get('security') || 'none';
    const type = params.get('type') || 'tcp';
    const network = type;
    const host = params.get('host') || undefined;
    const path = params.get('path') || undefined;
    const sni = params.get('sni') || undefined;
    const alpn = params.get('alpn') || undefined;
    const fingerprint = params.get('fp') || params.get('fingerprint') || undefined;
    
    // ریمارک (از fragment)
    let remark = url.hash ? decodeURIComponent(url.hash.slice(1)) : undefined;
    
    return {
      protocol: 'vless',
      server,
      port,
      uuid,
      password: uuid,
      network,
      security,
      type,
      host,
      path,
      sni,
      alpn,
      fingerprint,
      remark,
      rawConfig: config,
    };
  } catch (error) {
    console.error('Error parsing VLESS:', error);
    return null;
  }
}

// ساخت کانفیگ VLESS با ریمارک جدید
export function buildVless(config: ParsedConfig, newRemark: string): string {
  const params = new URLSearchParams();
  
  if (config.network && config.network !== 'tcp') {
    params.set('type', config.network);
  }
  if (config.security) {
    params.set('security', config.security);
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
  if (config.fingerprint) {
    params.set('fp', config.fingerprint);
  }
  
  const queryString = params.toString();
  const remarkEncoded = encodeURIComponent(newRemark);
  
  let url = `vless://${config.uuid}@${config.server}:${config.port}`;
  if (queryString) {
    url += `?${queryString}`;
  }
  url += `#${remarkEncoded}`;
  
  return url;
}
