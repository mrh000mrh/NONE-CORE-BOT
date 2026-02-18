from telegram import ReplyKeyboardMarkup, KeyboardButton

class Keyboard:
    def main_menu(self):
        keyboard = [
            [KeyboardButton("📤 آپلود HTML"), KeyboardButton("📤 ارسال دستی")],
            [KeyboardButton("📊 آمار"), KeyboardButton("📤 ارسال پیام به کانال")],
            [KeyboardButton("بازگشت به منو")]
        ]
        return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
