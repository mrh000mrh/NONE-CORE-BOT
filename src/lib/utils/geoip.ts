// سیستم تشخیص کشور از متن یا IP
import { COUNTRIES, COUNTRY_NAMES_TO_CODE, CITIES_TO_COUNTRY, CountryInfo } from '../parser/types';

interface GeoIPResponse {
  status: string;
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  isp?: string;
}

// کش برای جلوگیری از درخواست‌های تکراری
const geoCache: Map<string, CountryInfo> = new Map();

// استخراج کشور از متن
export function extractCountryFromText(text: string): CountryInfo | null {
  const lowerText = text.toLowerCase();
  
  // جستجوی کد کشور دو حرفی
  for (const [code, info] of Object.entries(COUNTRIES)) {
    // جستجوی کد کشور با مرز کلمه
    const codePattern = new RegExp(`\\b${code}\\b`, 'i');
    if (codePattern.test(text)) {
      return {
        code,
        name: info.nameFa,
        flag: info.flag,
      };
    }
    
    // جستجوی نام فارسی
    if (lowerText.includes(info.nameFa.toLowerCase())) {
      return {
        code,
        name: info.nameFa,
        flag: info.flag,
      };
    }
    
    // جستجوی نام انگلیسی
    if (lowerText.includes(info.nameEn.toLowerCase())) {
      return {
        code,
        name: info.nameFa,
        flag: info.flag,
      };
    }
  }
  
  // جستجوی شهرها
  for (const [city, code] of Object.entries(CITIES_TO_COUNTRY)) {
    if (lowerText.includes(city.toLowerCase())) {
      const info = COUNTRIES[code];
      if (info) {
        return {
          code,
          name: info.nameFa,
          flag: info.flag,
          city,
        };
      }
    }
  }
  
  return null;
}

// استخراج کشور از ریمارک کانفیگ
export function extractCountryFromRemark(remark: string | undefined): CountryInfo | null {
  if (!remark) return null;
  
  return extractCountryFromText(remark);
}

// دریافت کشور از IP با استفاده از GeoIP API
export async function getCountryFromIP(ip: string): Promise<CountryInfo | null> {
  // بررسی کش
  if (geoCache.has(ip)) {
    return geoCache.get(ip)!;
  }
  
  try {
    // استفاده از ip-api.com (رایگان)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,isp`);
    const data: GeoIPResponse = await response.json();
    
    if (data.status === 'success' && data.countryCode) {
      const info = COUNTRIES[data.countryCode];
      const result: CountryInfo = {
        code: data.countryCode,
        name: info?.nameFa || data.country || data.countryCode,
        flag: info?.flag || '🌍',
        city: data.city,
      };
      
      // ذخیره در کش
      geoCache.set(ip, result);
      
      return result;
    }
  } catch (error) {
    console.error('GeoIP API error:', error);
  }
  
  // تلاش با API جایگزین
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    
    if (data.country_code) {
      const info = COUNTRIES[data.country_code];
      const result: CountryInfo = {
        code: data.country_code,
        name: info?.nameFa || data.country_name || data.country_code,
        flag: info?.flag || '🌍',
        city: data.city,
      };
      
      // ذخیره در کش
      geoCache.set(ip, result);
      
      return result;
    }
  } catch (error) {
    console.error('Backup GeoIP API error:', error);
  }
  
  return null;
}

// تابع اصلی تشخیص کشور
export async function detectCountry(
  text: string,
  ip: string,
  remark?: string
): Promise<CountryInfo> {
  // اولویت ۱: از متن پست
  const fromText = extractCountryFromText(text);
  if (fromText) {
    return fromText;
  }
  
  // اولویت ۲: از ریمارک کانفیگ
  const fromRemark = extractCountryFromRemark(remark);
  if (fromRemark) {
    return fromRemark;
  }
  
  // اولویت ۳: از IP با GeoIP
  const fromIP = await getCountryFromIP(ip);
  if (fromIP) {
    return fromIP;
  }
  
  // پیش‌فرض: نامشخص
  return {
    code: 'XX',
    name: 'نامشخص',
    flag: '🌍',
  };
}

// نسخه همگام (بدون GeoIP) برای مواقعی که API در دسترس نیست
export function detectCountrySync(
  text: string,
  remark?: string
): CountryInfo {
  // از متن
  const fromText = extractCountryFromText(text);
  if (fromText) {
    return fromText;
  }
  
  // از ریمارک
  const fromRemark = extractCountryFromRemark(remark);
  if (fromRemark) {
    return fromRemark;
  }
  
  // پیش‌فرض
  return {
    code: 'XX',
    name: 'نامشخص',
    flag: '🌍',
  };
}

// دریافت نام و پرچم کشور از کد
export function getCountryInfo(code: string): CountryInfo {
  const info = COUNTRIES[code.toUpperCase()];
  if (info) {
    return {
      code: code.toUpperCase(),
      name: info.nameFa,
      flag: info.flag,
    };
  }
  
  return {
    code: code.toUpperCase(),
    name: code.toUpperCase(),
    flag: '🌍',
  };
}
