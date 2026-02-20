import re

def extract_from_html(html_content):
    configs = []

    # regex ساده و قوی برای لینک کانفیگ (حتی با فاصله یا خط جدید)
    pattern = r'(vless|vmess|trojan|ss|ssr|tuic|hysteria2?|hy2?)://[^\s<>"\']+(?:#[^\s<>"\']*)?'
    matches = re.findall(pattern, html_content, re.IGNORECASE | re.DOTALL)

    full_text = html_content.lower()

    for match in matches:
        link = match.strip()
        if len(link) < 30:
            continue

        location = "Unknown"
        ping = "Unknown"

        # استخراج لوکیشن از متن
        loc_match = re.search(r'لوکیشن\s*:\s*([a-zA-Z\s]+)', full_text)
        if loc_match:
            location = loc_match.group(1).strip().title()

        # استخراج پینگ
        ping_match = re.search(r'پینگ\s*:\s*(\d+)', full_text)
        if ping_match:
            ping = ping_match.group(1)

        config_type = link.split("://")[0].upper()

        configs.append({
            "link": link,
            "type": config_type,
            "location": location,
            "ping": ping
        })

    # حذف تکراری
    unique = {c['link']: c for c in configs}
    return list(unique.values())
