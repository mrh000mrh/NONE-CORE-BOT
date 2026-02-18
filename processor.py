from bs4 import BeautifulSoup
import re

def extract_from_html(html_content):
    soup = BeautifulSoup(html_content, 'lxml')
    configs = []

    text_elements = soup.find_all(string=True)
    full_text = "\n".join(t.strip() for t in text_elements if t.strip() and len(t.strip()) > 5)

    link_pattern = r'(vless|vmess|trojan|ss|ssr|tuic|hysteria2?|vlesss?|vmesss?|trojans?|shadowsocks|ssr|hy2?)://[^\s<>"\']+'
    links = re.findall(link_pattern, full_text, re.IGNORECASE)

    for raw_link in links:
        link = raw_link.strip()
        if len(link) < 30:
            continue

        location = "Unknown"
        ping = "Unknown"

        loc_match = re.search(r'(لوکیشن|location|country|کشور|سرور|server):?\s*([A-Za-z\s\-،]{2,30})', full_text, re.IGNORECASE)
        if loc_match:
            location = loc_match.group(2).strip().replace('،', '')

        ping_match = re.search(r'(پینگ|ping):?\s*(\d+)\s*(ms|میلی‌ثانیه)?', full_text, re.IGNORECASE)
        if ping_match:
            ping = ping_match.group(2)

        uuid = re.search(r'uuid=([^&]+)', link)
        uuid = uuid.group(1) if uuid else link.split("#")[0] if "#" in link else link

        config_type = link.split("://")[0].upper()

        configs.append({
            "uuid": uuid,
            "link": link,
            "location": location,
            "ping": ping,
            "type": config_type
        })

    unique = {c['link']: c for c in configs}
    return list(unique.values())
