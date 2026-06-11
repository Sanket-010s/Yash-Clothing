from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from config import get_settings

settings = get_settings()

database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(database_url, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

        result = await connection.execute(
            text(
                "SELECT COUNT(*) FROM information_schema.columns "
                "WHERE table_name = 'orders' AND column_name = 'gst_amount'"
            )
        )
        if result.scalar_one() > 0:
            await connection.execute(text("UPDATE orders SET gst_amount = 0 WHERE gst_amount IS NULL"))
            await connection.execute(text("ALTER TABLE orders ALTER COLUMN gst_amount SET DEFAULT 0"))