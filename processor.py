from bs4 import BeautifulSoup
import re

def extract_from_html(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')  # بدون نیاز به lxml (همیشه کار می‌کنه)
    configs = []

    # روش ۱: لینک‌های داخل <pre> یا <code> (رایج‌ترین در اکسپورت تلگرام)
    for tag in soup.find_all(['pre', 'code']):
        text = tag.get_text(strip=True)
        if text and re.match(r'^(vless|vmess|trojan|ss|ssr|tuic|hy2?)://', text, re.IGNORECASE):
            configs.append(text)

    # روش ۲: تمام متن صفحه (اگر لینک خارج از تگ باشه)
    full_text = soup.get_text(separator='\n', strip=True)
    link_pattern = r'(vless|vmess|trojan|ss|ssr|tuic|hysteria2?|vlesss?|vmesss?|trojans?|shadowsocks|ssr|hy2?)://[^\s<>"\']+'
    links = re.findall(link_pattern, full_text, re.IGNORECASE)
    configs.extend(links)

    # روش ۳: لینک‌های داخل <a href> (اگر کانال لینک رو لینک کرده باشه)
    for a in soup.find_all('a', href=True):
        href = a['href']
        if re.match(r'^(vless|vmess|trojan|ss|ssr|tuic|hy2?)://', href, re.IGNORECASE):
            configs.append(href)

    # حذف تکراری‌ها و فیلتر لینک‌های کوتاه
    unique_links = set()
    for link in configs:
        link = link.strip()
        if len(link) > 30 and re.match(r'^(vless|vmess|trojan|ss|ssr|tuic|hy2?)://', link, re.IGNORECASE):
            unique_links.add(link)

    # تبدیل به لیست دیکت
    final_configs = []
    for link in unique_links:
        config_type = link.split("://")[0].upper()
        final_configs.append({
            "link": link,
            "type": config_type,
            "location": "Unknown",
            "ping": "Unknown"
        })

    return final_configs
