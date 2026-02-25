// پارسر TUIC
import { ParsedConfig } from './types';

export function parseTuic(config: string): ParsedConfig | null {
  try {
    // tuic://uuid:password@server:port?params#remark
    const url = new URL(config);
    
    const uuid = url.username;
    const password = url.password;
    const server = url.hostname;
    const port = parseInt(url.port) || 443;
    
    // پارامترهای query
    const params = url.searchParams;
    const congestionControl = params.get('congestion_control') || 'bbr';
    const alpn = params.get('alpn') || undefined;
    const sni = params.get('sni') || server;
    
    // ریمارک
    let remark = url.hash ? decodeURIComponent(url.hash.slice(1)) : undefined;
    
    return {
      protocol: 'tuic',
      server,
      port,
      uuid,
      password,
      network: 'udp',
      security: 'tls',
      sni,
      alpn,
      remark,
      rawConfig: config,
    };
  } catch (error) {
    console.error('Error parsing TUIC:', error);
    return null;
  }
}

// ساخت کانفیگ TUIC با ریمارک جدید
export function buildTuic(config: ParsedConfig, newRemark: string): string {
  const params = new URLSearchParams();
  
  params.set('congestion_control', 'bbr');
  if (config.sni) {
    params.set('sni', config.sni);
  }
  if (config.alpn) {
    params.set('alpn', config.alpn);
  }
  
  const remarkEncoded = encodeURIComponent(newRemark);
  
  return `tuic://${config.uuid}:${config.password}@${config.server}:${config.port}?${params.toString()}#${remarkEncoded}`;
}
