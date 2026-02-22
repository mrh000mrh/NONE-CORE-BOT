def extract_from_html(html_content):
    configs = []
    if 'vless://' in html_content or 'vmess://' in html_content:
        configs.append({
            "link": "تست موفق - لینک پیدا شد",
            "type": "TEST",
            "location": "Unknown",
            "ping": "Unknown"
        })
    return configs
