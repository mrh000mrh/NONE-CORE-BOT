from telegram import ReplyKeyboardMarkup, KeyboardButton

class Keyboard:
    def main_menu(self):
        keyboard = [
            [KeyboardButton("📤 آپلود HTML یا متن لینک"), KeyboardButton("📤 ارسال دستی")],
            [KeyboardButton("📊 آمار"), KeyboardButton("📤 ارسال پیام به کانال")],
            [KeyboardButton("🗑️ پاک کردن تکراری‌ها")]
        ]
        return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
