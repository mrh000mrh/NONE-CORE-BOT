// تایپ‌های کانفیگ

export type Protocol = 'vless' | 'vmess' | 'trojan' | 'ss' | 'ssr' | 'tuic' | 'hysteria2';

export interface ParsedConfig {
  protocol: Protocol;
  server: string;
  port: number;
  uuid?: string;
  password?: string;
  method?: string;
  network?: string;
  security?: string;
  type?: string;
  host?: string;
  path?: string;
  sni?: string;
  alpn?: string;
  fingerprint?: string;
  remark?: string;
  rawConfig: string;
  // اطلاعات اضافی
  countryCode?: string;
  countryName?: string;
  city?: string;
  ping?: number;
}

export interface ExtractResult {
  configs: ParsedConfig[];
  total: number;
  new: number;
  duplicates: number;
  invalid: number;
  source: string;
}

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  city?: string;
}

// دیکشنری کدهای کشور به نام فارسی و انگلیسی
export const COUNTRIES: Record<string, { nameFa: string; nameEn: string; flag: string }> = {
  'DE': { nameFa: 'آلمان', nameEn: 'Germany', flag: '🇩🇪' },
  'NL': { nameFa: 'هلند', nameEn: 'Netherlands', flag: '🇳🇱' },
  'US': { nameFa: 'آمریکا', nameEn: 'United States', flag: '🇺🇸' },
  'GB': { nameFa: 'انگلیس', nameEn: 'United Kingdom', flag: '🇬🇧' },
  'FR': { nameFa: 'فرانسه', nameEn: 'France', flag: '🇫🇷' },
  'CA': { nameFa: 'کانادا', nameEn: 'Canada', flag: '🇨🇦' },
  'AU': { nameFa: 'استرالیا', nameEn: 'Australia', flag: '🇦🇺' },
  'JP': { nameFa: 'ژاپن', nameEn: 'Japan', flag: '🇯🇵' },
  'SG': { nameFa: 'سنگاپور', nameEn: 'Singapore', flag: '🇸🇬' },
  'HK': { nameFa: 'هنگ‌کنگ', nameEn: 'Hong Kong', flag: '🇭🇰' },
  'KR': { nameFa: 'کره جنوبی', nameEn: 'South Korea', flag: '🇰🇷' },
  'IN': { nameFa: 'هند', nameEn: 'India', flag: '🇮🇳' },
  'TR': { nameFa: 'ترکیه', nameEn: 'Turkey', flag: '🇹🇷' },
  'AE': { nameFa: 'امارات', nameEn: 'UAE', flag: '🇦🇪' },
  'RU': { nameFa: 'روسیه', nameEn: 'Russia', flag: '🇷🇺' },
  'CH': { nameFa: 'سوئیس', nameEn: 'Switzerland', flag: '🇨🇭' },
  'SE': { nameFa: 'سوئد', nameEn: 'Sweden', flag: '🇸🇪' },
  'NO': { nameFa: 'نروژ', nameEn: 'Norway', flag: '🇳🇴' },
  'FI': { nameFa: 'فنلاند', nameEn: 'Finland', flag: '🇫🇮' },
  'DK': { nameFa: 'دانمارک', nameEn: 'Denmark', flag: '🇩🇰' },
  'PL': { nameFa: 'لهستان', nameEn: 'Poland', flag: '🇵🇱' },
  'RO': { nameFa: 'رومانی', nameEn: 'Romania', flag: '🇷🇴' },
  'BG': { nameFa: 'بلغارستان', nameEn: 'Bulgaria', flag: '🇧🇬' },
  'ES': { nameFa: 'اسپانیا', nameEn: 'Spain', flag: '🇪🇸' },
  'IT': { nameFa: 'ایتالیا', nameEn: 'Italy', flag: '🇮🇹' },
  'PT': { nameFa: 'پرتغال', nameEn: 'Portugal', flag: '🇵🇹' },
  'AT': { nameFa: 'اتریش', nameEn: 'Austria', flag: '🇦🇹' },
  'BE': { nameFa: 'بلژیک', nameEn: 'Belgium', flag: '🇧🇪' },
  'IE': { nameFa: 'ایرلند', nameEn: 'Ireland', flag: '🇮🇪' },
  'CZ': { nameFa: 'چک', nameEn: 'Czech Republic', flag: '🇨🇿' },
  'HU': { nameFa: 'مجارستان', nameEn: 'Hungary', flag: '🇭🇺' },
  'UA': { nameFa: 'اوکراین', nameEn: 'Ukraine', flag: '🇺🇦' },
  'MY': { nameFa: 'مالزی', nameEn: 'Malaysia', flag: '🇲🇾' },
  'TH': { nameFa: 'تایلند', nameEn: 'Thailand', flag: '🇹🇭' },
  'VN': { nameFa: 'ویتنام', nameEn: 'Vietnam', flag: '🇻🇳' },
  'ID': { nameFa: 'اندونزی', nameEn: 'Indonesia', flag: '🇮🇩' },
  'PH': { nameFa: 'فیلیپین', nameEn: 'Philippines', flag: '🇵🇭' },
  'TW': { nameFa: 'تایوان', nameEn: 'Taiwan', flag: '🇹🇼' },
  'BR': { nameFa: 'برزیل', nameEn: 'Brazil', flag: '🇧🇷' },
  'AR': { nameFa: 'آرژانتین', nameEn: 'Argentina', flag: '🇦🇷' },
  'MX': { nameFa: 'مکزیک', nameEn: 'Mexico', flag: '🇲🇽' },
  'ZA': { nameFa: 'آفریقای جنوبی', nameEn: 'South Africa', flag: '🇿🇦' },
  'IL': { nameFa: 'اسرائیل', nameEn: 'Israel', flag: '🇮🇱' },
  'IR': { nameFa: 'ایران', nameEn: 'Iran', flag: '🇮🇷' },
  'AF': { nameFa: 'افغانستان', nameEn: 'Afghanistan', flag: '🇦🇫' },
  'PK': { nameFa: 'پاکستان', nameEn: 'Pakistan', flag: '🇵🇰' },
  'BD': { nameFa: 'بنگلادش', nameEn: 'Bangladesh', flag: '🇧🇩' },
  'EG': { nameFa: 'مصر', nameEn: 'Egypt', flag: '🇪🇬' },
  'NG': { nameFa: 'نیجریه', nameEn: 'Nigeria', flag: '🇳🇬' },
  'KE': { nameFa: 'کنیا', nameEn: 'Kenya', flag: '🇰🇪' },
  'NZ': { nameFa: 'نیوزیلند', nameEn: 'New Zealand', flag: '🇳🇿' },
  'LU': { nameFa: 'لوکزامبورگ', nameEn: 'Luxembourg', flag: '🇱🇺' },
  'IS': { nameFa: 'ایسلند', nameEn: 'Iceland', flag: '🇮🇸' },
  'EE': { nameFa: 'استونی', nameEn: 'Estonia', flag: '🇪🇪' },
  'LV': { nameFa: 'لتونی', nameEn: 'Latvia', flag: '🇱🇻' },
  'LT': { nameFa: 'لیتوانی', nameEn: 'Lithuania', flag: '🇱🇹' },
  'SK': { nameFa: 'اسلواکی', nameEn: 'Slovakia', flag: '🇸🇰' },
  'SI': { nameFa: 'اسلوونی', nameEn: 'Slovenia', flag: '🇸🇮' },
  'HR': { nameFa: 'کرواسی', nameEn: 'Croatia', flag: '🇭🇷' },
  'RS': { nameFa: 'صربستان', nameEn: 'Serbia', flag: '🇷🇸' },
  'GR': { nameFa: 'یونان', nameEn: 'Greece', flag: '🇬🇷' },
  'CY': { nameFa: 'قبرس', nameEn: 'Cyprus', flag: '🇨🇾' },
  'MT': { nameFa: 'مالت', nameEn: 'Malta', flag: '🇲🇹' },
  'AL': { nameFa: 'آلبانی', nameEn: 'Albania', flag: '🇦🇱' },
  'MK': { nameFa: 'مقدونیه', nameEn: 'North Macedonia', flag: '🇲🇰' },
  'GE': { nameFa: 'گرجستان', nameEn: 'Georgia', flag: '🇬🇪' },
  'AM': { nameFa: 'ارمنستان', nameEn: 'Armenia', flag: '🇦🇲' },
  'AZ': { nameFa: 'آذربایجان', nameEn: 'Azerbaijan', flag: '🇦🇿' },
  'KZ': { nameFa: 'قزاقستان', nameEn: 'Kazakhstan', flag: '🇰🇿' },
  'UZ': { nameFa: 'ازبکستان', nameEn: 'Uzbekistan', flag: '🇺🇿' },
  'CO': { nameFa: 'کلمبیا', nameEn: 'Colombia', flag: '🇨🇴' },
  'CL': { nameFa: 'شیلی', nameEn: 'Chile', flag: '🇨🇱' },
  'PE': { nameFa: 'پرو', nameEn: 'Peru', flag: '🇵🇪' },
  'VE': { nameFa: 'ونزوئلا', nameEn: 'Venezuela', flag: '🇻🇪' },
};

// دیکشنری نام کشورها به کد (برای جستجو در متن)
export const COUNTRY_NAMES_TO_CODE: Record<string, string> = {};

// پر کردن دیکشنری جستجو
Object.entries(COUNTRIES).forEach(([code, info]) => {
  COUNTRY_NAMES_TO_CODE[info.nameFa.toLowerCase()] = code;
  COUNTRY_NAMES_TO_CODE[info.nameEn.toLowerCase()] = code;
  COUNTRY_NAMES_TO_CODE[code.toLowerCase()] = code;
  // حالت‌های مختلف نوشتاری
  COUNTRY_NAMES_TO_CODE[info.nameFa] = code;
  COUNTRY_NAMES_TO_CODE[info.nameEn] = code;
});

// شهرهای معروف به کشور
export const CITIES_TO_COUNTRY: Record<string, string> = {
  // آلمان
  'frankfurt': 'DE',
  'فرانکفورت': 'DE',
  'berlin': 'DE',
  'برلین': 'DE',
  'munich': 'DE',
  'مونیخ': 'DE',
  'hamburg': 'DE',
  'هامبورگ': 'DE',
  'dusseldorf': 'DE',
  'دوسلدورف': 'DE',
  
  // هلند
  'amsterdam': 'NL',
  'آمستردام': 'NL',
  'rotterdam': 'NL',
  'راتردام': 'NL',
  
  // فرانسه
  'paris': 'FR',
  'پاریس': 'FR',
  'marseille': 'FR',
  'مارسئی': 'FR',
  
  // انگلیس
  'london': 'GB',
  'لندن': 'GB',
  'manchester': 'GB',
  'منچستر': 'GB',
  
  // آمریکا
  'new york': 'US',
  'نیویورک': 'US',
  'los angeles': 'US',
  'لوس آنجلس': 'US',
  'chicago': 'US',
  'شیکاگو': 'US',
  'miami': 'US',
  'میامی': 'US',
  'seattle': 'US',
  'سیاتل': 'US',
  'san francisco': 'US',
  'سانفرانسیسک': 'US',
  'dallas': 'US',
  'دالاس': 'US',
  
  // ترکیه
  'istanbul': 'TR',
  'استانبول': 'TR',
  'ankara': 'TR',
  'آنکارا': 'TR',
  
  // سنگاپور
  'singapore': 'SG',
  
  // ژاپن
  'tokyo': 'JP',
  'توکیو': 'JP',
  'osaka': 'JP',
  'اوساکا': 'JP',
  
  // کره
  'seoul': 'KR',
  'سئول': 'KR',
  
  // استرالیا
  'sydney': 'AU',
  'سیدنی': 'AU',
  'melbourne': 'AU',
  'ملبورن': 'AU',
  
  // کانادا
  'toronto': 'CA',
  'تورنتو': 'CA',
  'vancouver': 'CA',
  'ونکوور': 'CA',
  'montreal': 'CA',
  'مونترال': 'CA',
  
  // سوئیس
  'zurich': 'CH',
  'زوریخ': 'CH',
  'geneva': 'CH',
  'ژنو': 'CH',
  
  // روسیه
  'moscow': 'RU',
  'مسکو': 'RU',
  
  // امارات
  'dubai': 'AE',
  'دبی': 'AE',
  
  // هند
  'mumbai': 'IN',
  'مومبای': 'IN',
  'delhi': 'IN',
  'دهلی': 'IN',
  
  // برزیل
  'sao paulo': 'BR',
  'سائوپائولو': 'BR',
  
  // آرژانتین
  'buenos aires': 'AR',
  'بوئنوس آیرس': 'AR',
  
  // هنگ‌کنگ
  'hong kong': 'HK',
  'هنگ‌کنگ': 'HK',
  'hongkong': 'HK',
  
  // تایوان
  'taipei': 'TW',
  'تایپه': 'TW',
  
  // فنلاند
  'helsinki': 'FI',
  'هلسینکی': 'FI',
  
  // سوئد
  'stockholm': 'SE',
  'استکهلم': 'SE',
  
  // نروژ
  'oslo': 'NO',
  'اسلو': 'NO',
  
  // دانمارک
  'copenhagen': 'DK',
  'کپنهاگ': 'DK',
  
  // لهستان
  'warsaw': 'PL',
  'ورشو': 'PL',
  
  // رومانی
  'bucharest': 'RO',
  'بخارست': 'RO',
  
  // بلغارستان
  'sofia': 'BG',
  'صوفیه': 'BG',
  
  // اسپانیا
  'madrid': 'ES',
  'مادرید': 'ES',
  'barcelona': 'ES',
  'بارسلونا': 'ES',
  
  // ایتالیا
  'rome': 'IT',
  'رم': 'IT',
  'milan': 'IT',
  'میلان': 'IT',
  
  // پرتغال
  'lisbon': 'PT',
  'لیسبون': 'PT',
  
  // اتریش
  'vienna': 'AT',
  'وین': 'AT',
  
  // بلژیک
  'brussels': 'BE',
  'بروکسل': 'BE',
  
  // ایرلند
  'dublin': 'IE',
  'دوبلین': 'IE',
  
  // چک
  'prague': 'CZ',
  'پراگ': 'CZ',
  
  // مجارستان
  'budapest': 'HU',
  'بوداپست': 'HU',
  
  // اوکراین
  'kyiv': 'UA',
  'کی‌یف': 'UA',
  'kiev': 'UA',
  
  // مالزی
  'kuala lumpur': 'MY',
  'کوالالامپور': 'MY',
  
  // تایلند
  'bangkok': 'TH',
  'بانکوک': 'TH',
  
  // ویتنام
  'hanoi': 'VN',
  'هانوی': 'VN',
  'ho chi minh': 'VN',
  
  // اندونزی
  'jakarta': 'ID',
  'جاکارتا': 'ID',
  
  // فیلیپین
  'manila': 'PH',
  'مانیل': 'PH',
  
  // مکزیک
  'mexico city': 'MX',
  
  // آفریقای جنوبی
  'johannesburg': 'ZA',
  'ژوهانسبورگ': 'ZA',
  
  // مصر
  'cairo': 'EG',
  'قاهره': 'EG',
  
  // نیجریه
  'lagos': 'NG',
  'لاگوس': 'NG',
  
  // کنیا
  'nairobi': 'KE',
  'نایروبی': 'KE',
  
  // نیوزیلند
  'auckland': 'NZ',
  'اوکلند': 'NZ',
  
  // لوکزامبورگ
  'luxembourg': 'LU',
  
  // ایسلند
  'reykjavik': 'IS',
  
  // استونی
  'tallinn': 'EE',
  'تالین': 'EE',
  
  // لتونی
  'riga': 'LV',
  'ریگا': 'LV',
  
  // لیتوانی
  'vilnius': 'LT',
  'ویلنیوس': 'LT',
  
  // اسلواکی
  'bratislava': 'SK',
  
  // اسلوونی
  'ljubljana': 'SI',
  
  // کرواسی
  'zagreb': 'HR',
  'زاگرب': 'HR',
  
  // صربستان
  'belgrade': 'RS',
  'بلگراد': 'RS',
  
  // یونان
  'athens': 'GR',
  'آتن': 'GR',
  
  // قبرس
  'nicosia': 'CY',
  'نیکوزیا': 'CY',
  
  // مالت
  'valletta': 'MT',
  
  // گرجستان
  'tbilisi': 'GE',
  'تفلیس': 'GE',
  
  // ارمنستان
  'yerevan': 'AM',
  'ایروان': 'AM',
  
  // آذربایجان
  'baku': 'AZ',
  'باکو': 'AZ',
  
  // قزاقستان
  'almaty': 'KZ',
  'آلماتی': 'KZ',
};
