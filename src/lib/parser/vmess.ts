// پارسر VMess
import { ParsedConfig } from './types';

export function parseVmess(config: string): ParsedConfig | null {
  try {
    // vmess://base64encoded
    const base64Part = config.replace('vmess://', '');
    const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
    const data = JSON.parse(decoded);
    
    const server = data.add || data.server;
    const port = parseInt(data.port) || 443;
    const uuid = data.id || data.uuid;
    const network = data.net || 'tcp';
    const security = data.tls || 'none';
    const type = data.type || 'none';
    const host = data.host || undefined;
    const path = data.path || undefined;
    const sni = data.sni || host;
    const remark = data.ps || data.remark;
    
    return {
      protocol: 'vmess',
      server,
      port,
      uuid,
      password: uuid,
      network,
      security: security === 'tls' ? 'tls' : security,
      type,
      host,
      path,
      sni,
      remark,
      rawConfig: config,
    };
  } catch (error) {
    console.error('Error parsing VMess:', error);
    return null;
  }
}

// ساخت کانفیگ VMess با ریمارک جدید
export function buildVmess(config: ParsedConfig, newRemark: string): string {
  const data: Record<string, string | number> = {
    v: '2',
    ps: newRemark,
    add: config.server,
    port: config.port.toString(),
    id: config.uuid || '',
    scy: 'auto',
    net: config.network || 'tcp',
    type: config.type || 'none',
    host: config.host || '',
    path: config.path || '',
    tls: config.security === 'tls' ? 'tls' : '',
    sni: config.sni || '',
  };
  
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64');
  return `vmess://${encoded}`;
}
