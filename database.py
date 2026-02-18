import aiosqlite
from datetime import date, datetime, timedelta

class Database:
    def __init__(self, db_path):
        self.db_path = db_path

    async def init(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS configs (
                    uuid TEXT PRIMARY KEY,
                    link TEXT UNIQUE,
                    location TEXT,
                    ping TEXT,
                    remark TEXT,
                    post_date TEXT,
                    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS stats (
                    date DATE PRIMARY KEY,
                    members_added INTEGER DEFAULT 0,
                    configs_sent INTEGER DEFAULT 0
                )
            """)
            await db.commit()

    async def add_config(self, uuid, link, location, ping, remark, post_date):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT OR IGNORE INTO configs (uuid, link, location, ping, remark, post_date) VALUES (?, ?, ?, ?, ?, ?)",
                (uuid, link, location, ping, remark, post_date)
            )
            await db.commit()

    async def cleanup_old_configs(self, days=10):
        threshold = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("DELETE FROM configs WHERE post_date < ?", (threshold,))
            await db.commit()

    async def get_existing_links(self):
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("SELECT link FROM configs")
            rows = await cursor.fetchall()
            return {row[0] for row in rows}

    async def get_total_unique_configs(self):
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("SELECT COUNT(*) FROM configs")
            return (await cursor.fetchone())[0]

    async def get_today_members_added(self):
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("SELECT members_added FROM stats WHERE date = ?", (str(date.today()),))
            result = await cursor.fetchone()
            return result[0] if result else 0

    async def get_today_configs_sent(self):
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("SELECT configs_sent FROM stats WHERE date = ?", (str(date.today()),))
            result = await cursor.fetchone()
            return result[0] if result else 0

    async def increment_configs_sent(self, count):
        today = str(date.today())
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO stats (date, configs_sent) VALUES (?, ?)
                ON CONFLICT(date) DO UPDATE SET configs_sent = configs_sent + excluded.configs_sent
            """, (today, count))
            await db.commit()

    async def increment_members_added(self, count):
        today = str(date.today())
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO stats (date, members_added) VALUES (?, ?)
                ON CONFLICT(date) DO UPDATE SET members_added = members_added + excluded.members_added
            """, (today, count))
            await db.commit()
