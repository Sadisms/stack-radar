from typing import Any

from backend.core.database import execute, fetch_all, fetch_one
from backend.schemas.technologies import TechnologyCategoryCreate, TechnologyCreate, TechnologyUpdate


class TechnologyService:
    @staticmethod
    async def list_categories() -> list[dict[str, Any]]:
        query = """
            SELECT id, name, description, icon, created_at
            FROM technology_categories
            ORDER BY name ASC
        """
        return await fetch_all(query)

    @staticmethod
    async def get_category_by_name(name: str) -> dict[str, Any] | None:
        return await fetch_one("SELECT id FROM technology_categories WHERE name = $1", name)

    @staticmethod
    async def get_category_by_id(category_id: int) -> dict[str, Any] | None:
        return await fetch_one("SELECT id FROM technology_categories WHERE id = $1", category_id)

    @staticmethod
    async def create_category(category: TechnologyCategoryCreate) -> dict[str, Any]:
        insert_query = """
            INSERT INTO technology_categories (name, description, icon, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING id, name, description, icon, created_at
        """
        result = await fetch_one(insert_query, category.name, category.description, category.icon)
        return dict(result) if result else {}

    @staticmethod
    async def list_statuses() -> list[str]:
        query = "SELECT name FROM technology_statuses ORDER BY name ASC"
        items = await fetch_all(query)
        return [item["name"] for item in items]

    @staticmethod
    async def get_status_by_name(name: str) -> dict[str, Any] | None:
        return await fetch_one("SELECT id FROM technology_statuses WHERE name = $1", name)

    @staticmethod
    async def create_status(name: str) -> None:
        insert_query = "INSERT INTO technology_statuses (name, created_at) VALUES ($1, NOW())"
        await execute(insert_query, name)

    @staticmethod
    async def get_stats() -> tuple[list[dict[str, Any]], dict[str, Any] | None]:
        query = """
            SELECT
                t.id,
                t.name,
                ts.name as status,
                tc.name as category,
                COUNT(DISTINCT pt.project_id) as project_count,
                COUNT(DISTINCT CASE WHEN pt.usage_type = 'production' THEN pt.project_id END) as production_count,
                COUNT(DISTINCT CASE WHEN pt.usage_type = 'development' THEN pt.project_id END) as development_count,
                COUNT(DISTINCT CASE WHEN pt.usage_type = 'testing' THEN pt.project_id END) as testing_count
            FROM technologies t
            JOIN technology_statuses ts ON t.status_id = ts.id
            JOIN technology_categories tc ON t.category_id = tc.id
            LEFT JOIN project_technologies pt ON t.id = pt.technology_id
            GROUP BY t.id, t.name, ts.name, tc.name
            ORDER BY project_count DESC, t.name ASC
            LIMIT 100
        """
        items = await fetch_all(query)

        total_query = """
            SELECT
                COUNT(DISTINCT t.id) as total_technologies,
                COUNT(DISTINCT p.id) as total_projects,
                COUNT(DISTINCT pt.id) as total_usages,
                COUNT(DISTINCT tc.id) as total_categories
            FROM technologies t
            CROSS JOIN projects p
            LEFT JOIN project_technologies pt ON TRUE
            CROSS JOIN technology_categories tc
        """
        total_stats = await fetch_one(total_query)

        return items, total_stats

    @staticmethod
    async def count_technologies(where_clause: str, params: list[Any]) -> int:
        count_query = f"""
            SELECT COUNT(*) as total
            FROM technologies t
            JOIN technology_statuses ts ON t.status_id = ts.id
            WHERE {where_clause}
        """
        total = await fetch_one(count_query, *params)
        return total["total"] if total else 0

    @staticmethod
    async def list_technologies(
        where_clause: str,
        sort_field: str,
        sort_order: str,
        limit: int,
        offset: int,
        params: list[Any],
    ) -> list[dict[str, Any]]:
        data_query = f"""
            SELECT
                t.id, t.name, t.category_id, t.description, t.official_website,
                ts.name as status, t.created_at, t.updated_at
            FROM technologies t
            JOIN technology_statuses ts ON t.status_id = ts.id
            WHERE {where_clause}
            ORDER BY {sort_field} {sort_order}
            LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}
        """
        return await fetch_all(data_query, *params, limit, offset)

    @staticmethod
    async def create_technology(tech: TechnologyCreate, status_id: int) -> dict[str, Any]:
        insert_query = """
            INSERT INTO technologies (
                name, category_id, description, official_website,
                status_id, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING id, name, category_id, description, official_website,
                      status_id, created_at, updated_at
        """
        result = await fetch_one(
            insert_query,
            tech.name,
            tech.category_id,
            tech.description,
            tech.official_website,
            status_id,
        )
        return dict(result) if result else {}

    @staticmethod
    async def get_technology_by_id(tech_id: int) -> dict[str, Any] | None:
        query = """
            SELECT
                t.id, t.name, t.category_id, t.description, t.official_website,
                ts.name as status, t.created_at, t.updated_at
            FROM technologies t
            JOIN technology_statuses ts ON t.status_id = ts.id
            WHERE t.id = $1
        """
        return await fetch_one(query, tech_id)

    @staticmethod
    async def get_technology_simple_by_id(tech_id: int) -> dict[str, Any] | None:
        return await fetch_one("SELECT id FROM technologies WHERE id = $1", tech_id)

    @staticmethod
    async def update_technology(tech_id: int, tech: TechnologyUpdate, status_id: int) -> dict[str, Any]:
        update_query = """
            UPDATE technologies
            SET name = $1, category_id = $2, description = $3,
                official_website = $4, status_id = $5, updated_at = NOW()
            WHERE id = $6
            RETURNING id, name, category_id, description, official_website,
                      status_id, created_at, updated_at
        """
        result = await fetch_one(
            update_query,
            tech.name,
            tech.category_id,
            tech.description,
            tech.official_website,
            status_id,
            tech_id,
        )
        return dict(result) if result else {}

    @staticmethod
    async def delete_technology(tech_id: int) -> None:
        await execute("DELETE FROM technologies WHERE id = $1", tech_id)

    @staticmethod
    async def get_version_by_id(version_id: int, technology_id: int) -> dict[str, Any] | None:
        return await fetch_one(
            "SELECT id FROM technology_versions WHERE id = $1 AND technology_id = $2",
            version_id,
            technology_id,
        )
