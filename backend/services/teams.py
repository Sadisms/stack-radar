from typing import Any

from backend.core.database import fetch_all, fetch_one
from backend.schemas.teams import TeamCreate


class TeamService:
    @staticmethod
    async def count_teams(where_clause: str, params: list[Any]) -> int:
        count_query = f"SELECT COUNT(*) as total FROM teams t WHERE {where_clause}"
        total = await fetch_one(count_query, *params)
        return total["total"] if total else 0

    @staticmethod
    async def list_teams(
        where_clause: str,
        sort_field: str,
        sort_order: str,
        limit: int,
        offset: int,
        params: list[Any],
    ) -> list[dict[str, Any]]:
        data_query = f"""
            SELECT
                t.id, t.name, t.description, t.lead_id,
                t.created_at, t.updated_at
            FROM teams t
            WHERE {where_clause}
            ORDER BY {sort_field} {sort_order}
            LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}
        """
        return await fetch_all(data_query, *params, limit, offset)

    @staticmethod
    async def get_team_by_id(team_id: int) -> dict[str, Any] | None:
        query = """
            SELECT id, name, description, lead_id, created_at, updated_at
            FROM teams
            WHERE id = $1
        """
        return await fetch_one(query, team_id)

    @staticmethod
    async def create_team(team: TeamCreate) -> dict[str, Any]:
        insert_query = """
            INSERT INTO teams (name, description, lead_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id, name, description, lead_id, created_at, updated_at
        """
        result = await fetch_one(insert_query, team.name, team.description, team.lead_id)
        return dict(result) if result else {}

    @staticmethod
    async def update_team(team_id: int, team: TeamCreate) -> dict[str, Any] | None:
        update_query = """
            UPDATE teams
            SET name = $1, description = $2, lead_id = $3, updated_at = NOW()
            WHERE id = $4
            RETURNING id, name, description, lead_id, created_at, updated_at
        """
        result = await fetch_one(
            update_query,
            team.name,
            team.description,
            team.lead_id,
            team_id
        )
        return dict(result) if result else None

    @staticmethod
    async def delete_team(team_id: int) -> None:
        await fetch_one("DELETE FROM teams WHERE id = $1", team_id)
