from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

import asyncpg
from asyncpg import Pool

from backend.config import get_settings


class Database:
    """
    Database connection pool manager
    """
    _pool: Pool | None = None

    @classmethod
    async def connect(cls) -> None:
        """
        Initialize database connection pool
        """
        if cls._pool is None:
            settings = get_settings()
            cls._pool = await asyncpg.create_pool(
                host=settings.database.host,
                port=settings.database.port,
                user=settings.database.username,
                password=settings.database.password,
                database=settings.database.database,
                min_size=settings.database.min_pool_size,
                max_size=settings.database.max_pool_size,
            )

    @classmethod
    async def disconnect(cls) -> None:
        """
        Close database connection pool
        """
        if cls._pool is not None:
            await cls._pool.close()
            cls._pool = None

    @classmethod
    def get_pool(cls) -> Pool:
        """
        Get database connection pool

        Raises:
            RuntimeError: If pool is not initialized
        """
        if cls._pool is None:
            raise RuntimeError("Database pool is not initialized")
        return cls._pool


@asynccontextmanager
async def get_db_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """
    Get database connection from pool

    Yields:
        Database connection
    """
    pool = Database.get_pool()
    async with pool.acquire() as connection:
        yield connection


async def fetch_one(query: str, *args: Any) -> dict[str, Any] | None:
    """
    Execute query and fetch one row as dictionary

    Args:
        query: SQL query
        *args: Query parameters

    Returns:
        Row as dictionary or None if not found
    """
    async with get_db_connection() as conn:
        row = await conn.fetchrow(query, *args)
        return dict(row) if row else None


async def fetch_all(query: str, *args: Any) -> list[dict[str, Any]]:
    """
    Execute query and fetch all rows as list of dictionaries

    Args:
        query: SQL query
        *args: Query parameters

    Returns:
        List of rows as dictionaries
    """
    async with get_db_connection() as conn:
        rows = await conn.fetch(query, *args)
        return [dict(row) for row in rows]


async def fetch_val(query: str, *args: Any) -> Any:
    """
    Execute query and fetch single value

    Args:
        query: SQL query
        *args: Query parameters

    Returns:
        Single value
    """
    async with get_db_connection() as conn:
        return await conn.fetchval(query, *args)


async def execute(query: str, *args: Any) -> str:
    """
    Execute query without returning results

    Args:
        query: SQL query
        *args: Query parameters

    Returns:
        Status message
    """
    async with get_db_connection() as conn:
        return await conn.execute(query, *args)
