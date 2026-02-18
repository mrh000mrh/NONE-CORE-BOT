import re

def extract_from_html(html_content):
    configs = []

    # تمام متن رو بدون BeautifulSoup استخراج می‌کنیم (ساده‌تر و بدون وابستگی lxml)
    full_text = html_content

    # regex قوی برای هر نوع لینک کانفیگ
    pattern = r'(vless|vmess|trojan|ss|ssr|tuic|hysteria2?|hy2?|shadowsocks)://[^\s<>"\']+'
    links = re.findall(pattern, full_text, re.IGNORECASE | re.DOTALL)

    for raw_link in links:
        link = raw_link.strip()
        if len(link) < 30:
            continue

        configs.append({
            "link": link,
            "type": link.split("://")[0].upper(),
            "location": "Unknown",
            "ping": "Unknown"
        })

    # حذف تکراری
    unique = {c['link']: c for c in configs}
    return list(unique.values())
