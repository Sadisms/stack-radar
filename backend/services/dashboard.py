from typing import Any
from backend.core.database import fetch_all, fetch_one


class DashboardService:
    @staticmethod
    async def get_overview_stats() -> dict[str, int]:
        """Get overall counts for dashboard"""
        query = """
            SELECT
                (SELECT COUNT(*) FROM projects) as total_projects,
                (SELECT COUNT(*) FROM technologies) as total_technologies,
                (SELECT COUNT(*) FROM teams) as total_teams,
                (SELECT COUNT(*) FROM users) as total_users
        """
        result = await fetch_one(query)
        return dict(result) if result else {}

    @staticmethod
    async def get_technology_usage() -> list[dict[str, Any]]:
        """Get most used technologies across projects"""
        query = """
            SELECT
                t.name,
                COUNT(DISTINCT pt.project_id) as project_count,
                tc.name as category_name
            FROM technologies t
            LEFT JOIN project_technologies pt ON t.id = pt.technology_id
            LEFT JOIN technology_categories tc ON t.category_id = tc.id
            GROUP BY t.id, t.name, tc.name
            ORDER BY project_count DESC
            LIMIT 10
        """
        results = await fetch_all(query)
        return [dict(r) for r in results]

    @staticmethod
    async def get_project_status_distribution() -> list[dict[str, Any]]:
        """Get project count by status"""
        query = """
            SELECT
                status,
                COUNT(*) as count
            FROM projects
            GROUP BY status
            ORDER BY count DESC
        """
        results = await fetch_all(query)
        return [dict(r) for r in results]

    @staticmethod
    async def get_recent_projects() -> list[dict[str, Any]]:
        """Get 5 most recent projects with team info"""
        query = """
            SELECT
                p.id,
                p.name,
                p.status,
                p.created_at,
                t.name as team_name,
                (SELECT COUNT(*) FROM project_technologies WHERE project_id = p.id) as tech_count
            FROM projects p
            LEFT JOIN teams t ON p.team_id = t.id
            ORDER BY p.created_at DESC
            LIMIT 5
        """
        results = await fetch_all(query)
        return [dict(r) for r in results]

    @staticmethod
    async def get_team_summary() -> list[dict[str, Any]]:
        """Get team statistics"""
        query = """
            SELECT
                t.id,
                t.name,
                COUNT(DISTINCT p.id) as project_count,
                u.full_name as lead_name
            FROM teams t
            LEFT JOIN projects p ON p.team_id = t.id
            LEFT JOIN users u ON t.lead_id = u.id
            GROUP BY t.id, t.name, u.full_name
            ORDER BY project_count DESC
            LIMIT 5
        """
        results = await fetch_all(query)
        return [dict(r) for r in results]

    @staticmethod
    async def get_technology_by_category() -> list[dict[str, Any]]:
        """Get technology count by category"""
        query = """
            SELECT
                tc.name as category,
                COUNT(t.id) as count
            FROM technology_categories tc
            LEFT JOIN technologies t ON tc.id = t.category_id
            GROUP BY tc.id, tc.name
            ORDER BY count DESC
        """
        results = await fetch_all(query)
        return [dict(r) for r in results]
