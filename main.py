import logging
import asyncio
import random

from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from telegram.error import TimedOut

from config import Config
from database import Database
from processor import extract_from_html
from sender import Sender
from keyboard import Keyboard

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NonecoreBot:
    def __init__(self):
        self.config = Config()
        self.db = Database(self.config.DATABASE_PATH)
        self.sender = Sender(self.config)
        self.keyboard = Keyboard()
        self.application = None
        self.user_states = {}
        self.pending_configs = []

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if update.effective_user.id != self.config.ADMIN_ID:
            return

        await update.message.reply_text(
            f"👋 خوش آمدید به {self.config.BRAND_NAME} Bot",
            reply_markup=self.keyboard.main_menu()
        )

    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.effective_user.id
        text = update.message.text

        if user_id != self.config.ADMIN_ID:
            return

        if text == "📤 آپلود HTML":
            await update.message.reply_text("لطفاً فایل HTML ارسال کنید.")
            self.user_states[user_id] = {"state": "waiting_file"}
            return

        if text == "📤 ارسال از صف":
            if not self.pending_configs:
                await update.message.reply_text("هیچ کانفیگی در صف باقی نمانده است.")
                return

            await update.message.reply_text(f"الان {len(self.pending_configs)} کانفیگ در صف باقی مانده است.\n\nچند تا ارسال کنم؟ (عدد یا 'همه')")
            self.user_states[user_id] = {"state": "ask_count_from_pending", "configs": self.pending_configs}
            return

        if text == "📊 آمار":
            members_today = await self.db.get_today_members_added()
            configs_sent_today = await self.db.get_today_configs_sent()
            pending_count = len(self.pending_configs)
            total_unique = await self.db.get_total_unique_configs()
            await update.message.reply_text(
                f"آمار امروز:\n"
                f"اعضای جدید کانال: {members_today}\n"
                f"کانفیگ ارسال‌شده امروز: {configs_sent_today}\n"
                f"کانفیگ در صف باقی‌مانده: {pending_count}\n"
                f"کل کانفیگ‌های منحصربه‌فرد تا حالا: {total_unique}"
            )
            return

        if text == "📤 ارسال پیام به کانال":
            await update.message.reply_text("متن، عکس یا فایل بفرستید – مستقیم به کانال ارسال می‌شه.")
            self.user_states[user_id] = {"state": "sending_to_channel"}
            return

        if text == "بازگشت به منو":
            await self.start(update, context)
            return

        if self.user_states.get(user_id, {}).get("state") == "sending_to_channel":
            if update.message.text or update.message.photo or update.message.document:
                for channel in self.config.CHANNELS:
                    try:
                        if update.message.text:
                            await context.bot.send_message(channel, update.message.text)
                        elif update.message.photo:
                            await context.bot.send_photo(channel, update.message.photo[-1].file_id, caption=update.message.caption)
                        elif update.message.document:
                            await context.bot.send_document(channel, update.message.document.file_id, caption=update.message.caption)
                    except TimedOut:
                        await update.message.reply_text("تلگرام کند بود، دوباره امتحان کنید.")
                    except Exception as e:
                        logger.error(f"ارسال به کانال شکست خورد: {e}")
                await update.message.reply_text("پیام به کانال ارسال شد.")
            self.user_states.pop(user_id, None)
            return

        if self.user_states.get(user_id, {}).get("state") == "waiting_file":
            if update.message.document and update.message.document.file_name.lower().endswith('.html'):
                await update.message.reply_text("در حال استخراج...")
                try:
                    file = await update.message.document.get_file()
                    html_bytes = await file.download_as_bytearray()
                    html_content = html_bytes.decode('utf-8', errors='ignore')
                except Exception as e:
                    logger.error(f"دانلود فایل شکست خورد: {e}")
                    await update.message.reply_text("دانلود فایل شکست خورد.")
                    return

                configs = extract_from_html(html_content)
                logger.info(f"استخراج شد: {len(configs)} کانفیگ")

                if not configs:
                    await update.message.reply_text("هیچ کانفیگی پیدا نشد.")
                    self.user_states.pop(user_id, None)
                    return

                configs = [c for c in configs if 'link' in c]
                existing = await self.db.get_existing_links()
                unique_new = [c for c in configs if c['link'] not in existing]

                all_configs = self.pending_configs + unique_new
                random.shuffle(all_configs)

                self.pending_configs = all_configs

                if not all_configs:
                    await update.message.reply_text("هیچ کانفیگ جدیدی نبود.")
                    self.user_states.pop(user_id, None)
                    return

                self.user_states[user_id] = {"configs": all_configs, "state": "ask_count"}
                await update.message.reply_text(f"{len(all_configs)} کانفیگ آماده (قبلی + جدید).\n\nچند تا ارسال کنم؟ (عدد یا 'همه')")
            else:
                await update.message.reply_text("فایل HTML بفرستید.")
            return

        if self.user_states.get(user_id, {}).get("state") in ["ask_count", "ask_count_from_pending"]:
            total = len(self.user_states[user_id]["configs"])

            if text.lower() == 'همه':
                count = total
            else:
                try:
                    count = int(text)
                    if count > total or count <= 0:
                        raise ValueError
                except:
                    await update.message.reply_text(f"عدد بین 1 تا {total} یا 'همه'")
                    return

            to_send = self.user_states[user_id]["configs"][:count]
            self.pending_configs = self.user_states[user_id]["configs"][count:]

            try:
                sent_count = await self.sender.send_to_channel(context, to_send)
                await self.db.increment_configs_sent(sent_count)
                for cfg in to_send:
                    await self.db.add_config(cfg['uuid'], cfg['link'], cfg.get('location', 'Unknown'), cfg.get('ping', 'Unknown'))
            except TimedOut:
                await update.message.reply_text("تلگرام کند بود، دوباره امتحان کنید.")
                return
            except Exception as e:
                logger.error(f"ارسال شکست خورد: {e}")
                await update.message.reply_text("ارسال شکست خورد.")
                return

            await update.message.reply_text(f"✅ {len(to_send)} کانفیگ ارسال شد.", reply_markup=self.keyboard.main_menu())

            self.user_states.pop(user_id, None)
            return

        await update.message.reply_text("دستور نامعتبر.")

    def run(self):
        if not self.config.BOT_TOKEN:
            logger.error("BOT_TOKEN تعریف نشده!")
            return

        self.application = Application.builder().token(self.config.BOT_TOKEN).build()

        self.application.add_handler(CommandHandler("start", self.start))
        self.application.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, self.handle_message))

        loop = asyncio.get_event_loop()
        loop.run_until_complete(self.db.init())

        logger.info("ربات استارت شد...")
        self.application.run_polling(drop_pending_updates=True)

if __name__ == '__main__':
    bot = NonecoreBot()
    asyncio.run(bot.run())
