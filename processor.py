import re

def extract_from_html(html_content):
    configs = []

    # regex برای لینک کامل تا # یا انتها
    link_pattern = r'(vless|vmess|trojan|ss|ssr|tuic|hysteria2?|vlesss?|vmesss?|trojans?|shadowsocks|ssr|hy2?)://(.*?)(#|$)'
    matches = re.findall(link_pattern, html_content, re.IGNORECASE | re.DOTALL)

    for proto, params, end in matches:
        link = proto + '://' + params + end
        link = link.strip()
        if len(link) < 30:
            continue

        location = "Unknown"
        ping = "Unknown"
        remark = "@nonecorebot"

        # استخراج لوکیشن از متن
        loc_match = re.search(r'(لوکیشن|location|country|کشور|سرور|server|منطقه):?\s*([A-Za-z\s\-،🇦-🇿]{2,30})', html_content, re.IGNORECASE | re.UNICODE)
        if loc_match:
            location = loc_match.group(2).strip().replace('،', '')

        # استخراج پینگ
        ping_match = re.search(r'(پینگ|ping|latency):?\s*(\d+)\s*(ms|میلی‌ثانیه)?', html_content, re.IGNORECASE)
        if ping_match:
            ping = ping_match.group(2)

        # استخراج ریمارک از # انتها
        remark_match = re.search(r'#([^\s]+)', link)
        if remark_match:
            remark = remark_match.group(1).strip()

        configs.append({
            "uuid": link.split("@")[0] if "@" in link else link.split("://")[1],
            "link": link,
            "location": location,
            "ping": ping,
            "type": proto.upper(),
            "remark": remark
        })

    # حذف تکراری
    unique = {c['link']: c for c in configs}
    return list(unique.values())
