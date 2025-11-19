from typing import Any

from backend.core.database import fetch_all, fetch_one
from backend.core.pagination import PaginationParams, SortParams


class AuthService:
    @staticmethod
    async def get_user_by_email(email: str) -> dict[str, Any] | None:
        query = """
            SELECT 
                id, email, password_hash, full_name,
                is_admin, is_active, created_at, updated_at
            FROM users
            WHERE email = $1 AND is_active = TRUE
        """
        return await fetch_one(query, email)

    @staticmethod
    async def get_user_by_id(user_id: int) -> dict[str, Any] | None:
        query = """
            SELECT 
                id, email, full_name, is_admin, is_active,
                created_at, updated_at
            FROM users
            WHERE id = $1
        """
        return await fetch_one(query, user_id)

    @staticmethod
    async def count_users(where_clause: str, params: list[Any]) -> int:
        count_query = f"""
            SELECT COUNT(*) as total
            FROM users u
            WHERE {where_clause}
        """
        total = await fetch_one(count_query, *params)
        return total["total"] if total else 0

    @staticmethod
    async def list_users(
        where_clause: str,
        sort_field: str,
        sort_order: str,
        limit: int,
        offset: int,
        params: list[Any],
    ) -> list[dict[str, Any]]:
        data_query = f"""
            SELECT 
                u.id,
                u.email,
                u.full_name,
                u.is_admin,
                u.is_active,
                u.created_at,
                u.updated_at
            FROM users u
            WHERE {where_clause}
            ORDER BY {sort_field} {sort_order}
            LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}
        """
        return await fetch_all(data_query, *params, limit, offset)

    @staticmethod
    async def create_user(
        email: str,
        password_hash: str,
        full_name: str,
        is_admin: bool,
        is_active: bool
    ) -> dict[str, Any]:
        query = """
            INSERT INTO users (email, password_hash, full_name, is_admin, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING id, email, full_name, is_admin, is_active, created_at, updated_at
        """
        result = await fetch_one(query, email, password_hash, full_name, is_admin, is_active)
        return dict(result) if result else {}

    @staticmethod
    async def update_user(
        user_id: int,
        email: str,
        full_name: str,
        is_admin: bool,
        is_active: bool
    ) -> dict[str, Any] | None:
        query = """
            UPDATE users 
            SET email = $1, full_name = $2, is_admin = $3, is_active = $4, updated_at = NOW()
            WHERE id = $5
            RETURNING id, email, full_name, is_admin, is_active, created_at, updated_at
        """
        result = await fetch_one(query, email, full_name, is_admin, is_active, user_id)
        return dict(result) if result else None

    @staticmethod
    async def delete_user(user_id: int) -> None:
        await fetch_one("DELETE FROM users WHERE id = $1", user_id)

    @staticmethod
    async def update_user_password(user_id: int, password_hash: str) -> None:
        query = "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2"
        await fetch_one(query, password_hash, user_id)
