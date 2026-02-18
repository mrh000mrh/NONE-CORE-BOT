import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    BOT_TOKEN = os.getenv("BOT_TOKEN")
    ADMIN_ID = int(os.getenv("ADMIN_ID") or 0)
    BRAND_NAME = os.getenv("BRAND_NAME", "NONEcore")
    CHANNELS = os.getenv("CHANNELS", "@nonecorebot").split(",")
    DATABASE_PATH = os.getenv("DATABASE_PATH", "database.db")

    ALLOWED_CLIENTS = ["v2rayNG", "Streisand", "Hiddify"]
