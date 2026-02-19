import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    BOT_TOKEN = os.getenv("BOT_TOKEN")
    ADMIN_ID = int(os.getenv("ADMIN_ID") or 0)
    BRAND_NAME = os.getenv("BRAND_NAME", "NONEcore")
    CHANNELS = [c.strip() for c in os.getenv("CHANNELS", "@nonecorebot").split(",") if c.strip()]
    DATABASE_PATH = os.getenv("DATABASE_PATH", "database.db")
