import random
from telegram import InlineKeyboardMarkup, InlineKeyboardButton

class Sender:
    def __init__(self, config):
        self.config = config
        self.random_messages = [
            "آمار ارسال: کل {total} کانفیگ - ارسال در این بار: {sent} کانفیگ",
        ]

    async def send_to_channel(self, context, configs, db):
        sent = 0
        for cfg in configs:
            text = self.format_message(cfg)
            for channel in self.config.CHANNELS:
                try:
                    await context.bot.send_message(
                        chat_id=channel,
                        text=text,
                        parse_mode="HTML",
                        disable_web_page_preview=True
                    )
                except Exception as e:
                    print(f"خطا در ارسال به {channel}: {e}")
            sent += 1

        random_msg = random.choice(self.random_messages).format(total=len(configs), sent=sent)
        await context.bot.send_message(
            chat_id=self.config.CHANNELS[0],
            text=random_msg
        )
        return sent

    def format_message(self, cfg):
        location = cfg.get('location', 'Unknown')
        short_loc = location[:2].upper() if location != 'Unknown' else ''
        ping = cfg.get('ping', 'Unknown')
        quality = "عالی" if ping.isdigit() and int(ping) <= 50 else "خوب" if ping.isdigit() and int(ping) <= 200 else "متوسط"
        link = cfg['link']
        config_type = cfg.get('type', 'VLESS')
        remark = cfg.get('remark', 'NONEcore')

        return f"""
NONEcore Config
📍 {location} {short_loc} 📶 {ping}ms ({quality})

<tg-spoiler><code>{link}</code></tg-spoiler>
ریمارک: @nonecorebot {short_loc}

#{config_type} #فیلترشکن #کانفیگ #VPN #اینترنت_آزاد

✅ فعال | ⚠️ فقط برای وب‌گردی – ترید و بانک توصیه نمی‌شود  
کانفیگ را کپی کنید و در کلاینت‌های v2rayNG - Streisand - Hiddify و... استفاده کنید.

@nonecorebot
"""
