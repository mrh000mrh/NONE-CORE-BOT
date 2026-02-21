import re

def extract_from_html(html_content):
    configs = []

    # متن رو به خطوط تقسیم می‌کنیم تا دقیق‌تر اسکن کنیم
    lines = html_content.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue

        # پیدا کردن لینک با regex ساده و قوی (حتی اگر در وسط خط باشه)
        match = re.search(r'(vless|vmess|trojan|ss|ssr|tuic|hysteria2?|hy2?)://[^\s<>"\']+', line, re.IGNORECASE)
        if match:
            link = match.group(0)
            configs.append({
                "link": link,
                "type": link.split("://")[0].upper(),
                "location": "Unknown",
                "ping": "Unknown"
            })

    # حذف تکراری
    unique = {c['link']: c for c in configs}
    return list(unique.values())
