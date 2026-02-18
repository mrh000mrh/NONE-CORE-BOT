from bs4 import BeautifulSoup
import re
from datetime import datetime

def extract_from_html(html_content):
    soup = BeautifulSoup(html_content, 'lxml')
    configs = []

    full_text = soup.get_text(separator='\n', strip=True)

    # پیدا کردن لینک‌ها
    link_pattern = r'(vless|vmess|trojan|ss|ssr|tuic|hysteria2?|vlesss?|vmesss?|trojans?|shadowsocks|ssr|hy2?)://[^\s<>"\']+'
    links = re.findall(link_pattern, full_text, re.IGNORECASE)

    # پیدا کردن تاریخ پست (اگر در متن بود)
    date_pattern = r'(\d{4}/\d{2}/\d{2}|\d{4}-\d{2}-\d{2})'
    post_date_match = re.search(date_pattern, full_text)
    post_date = post_date_match.group(1) if post_date_match else datetime.now().strftime("%Y-%m-%d")

    for raw_link in links:
        link = raw_link.strip()
        if len(link) < 30:
            continue

        location = "Unknown"
        ping = "Unknown"
        remark = "NONEcore"

        # لوکیشن
        loc_match = re.search(r'(لوکیشن|location|country|کشور|سرور|server|منطقه):?\s*([A-Za-z\s\-،🇦-🇿]{2,30})', full_text, re.IGNORECASE | re.UNICODE)
        if loc_match:
            location = loc_match.group(2).strip().replace('،', '')

        # پینگ
        ping_match = re.search(r'(پینگ|ping|latency):?\s*(\d+)\s*(ms|میلی‌ثانیه)?', full_text, re.IGNORECASE)
        if ping_match:
            ping = ping_match.group(2)

        # ریمارک (از ps یا # یا متن نزدیک لینک)
        remark_match = re.search(r'ps=([^&]+)', link) or re.search(r'#([^\s]+)', link)
        if remark_match:
            remark = remark_match.group(1).strip()

        uuid = re.search(r'uuid=([^&]+)', link) or re.search(r'#([^\s]+)', link)
        uuid = uuid.group(1) if uuid else link.split("#")[0] if "#" in link else link

        config_type = link.split("://")[0].upper()

        configs.append({
            "uuid": uuid,
            "link": link,
            "location": location,
            "ping": ping,
            "remark": remark,
            "type": config_type,
            "post_date": post_date
        })

    unique = {c['link']: c for c in configs}
    return list(unique.values())
