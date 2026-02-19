from bs4 import BeautifulSoup
import re
from datetime import datetime

def extract_from_html(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    configs = []

    full_text = soup.get_text(separator='\n', strip=True)

    link_pattern = r'(vless|vmess|trojan|ss|ssr|tuic|hysteria2?|hy2?|shadowsocks)://[^\s<>"\']+(?:#[^\s<>"\']*)?'
    matches = re.findall(link_pattern, full_text, re.IGNORECASE | re.DOTALL)

    date_match = re.search(r'(\d{4}/\d{2}/\d{2}|\d{4}-\d{2}-\d{2})', full_text)
    post_date = date_match.group(1) if date_match else datetime.now().strftime("%Y-%m-%d")

    for match in matches:
        link = match.strip()
        if len(link) < 30:
            continue

        location = "Unknown"
        ping = "Unknown"
        remark = "NONEcore"

        loc_match = re.search(r'(لوکیشن|location|country|کشور|سرور|server|منطقه):?\s*([A-Za-z\s\-،🇦-🇿]{2,30})', full_text, re.IGNORECASE | re.UNICODE)
        if loc_match:
            location = loc_match.group(2).strip().replace('،', '')

        ping_match = re.search(r'(پینگ|ping|latency):?\s*(\d+)\s*(ms|میلی‌ثانیه)?', full_text, re.IGNORECASE)
        if ping_match:
            ping = ping_match.group(2)

        remark_match = re.search(r'#([^\s]+)', link)
        if remark_match:
            remark = remark_match.group(1).strip()

        config_type = link.split("://")[0].upper()

        configs.append({
            "uuid": link.split("@")[0] if "@" in link else link.split("://")[1].split(":")[0],
            "link": link,
            "location": location,
            "ping": ping,
            "remark": remark,
            "type": config_type,
            "post_date": post_date
        })

    unique = {c['link']: c for c in configs}
    return list(unique.values())
