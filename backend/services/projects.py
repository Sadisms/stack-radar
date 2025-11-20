from typing import Any

from backend.core.database import execute, fetch_all, fetch_one
from backend.schemas.projects import ProjectCreate, ProjectTechnologyCreate, ProjectUpdate


class ProjectService:
    @staticmethod
    async def count_projects(where_clause: str, params: list[Any]) -> int:
        count_query = f"SELECT COUNT(*) as total FROM projects p WHERE {where_clause}"
        total = await fetch_one(count_query, *params)
        return total["total"] if total else 0

    @staticmethod
    async def list_projects(
        where_clause: str,
        sort_field: str,
        sort_order: str,
        limit: int,
        offset: int,
        params: list[Any],
    ) -> list[dict[str, Any]]:
        data_query = f"""
            SELECT 
                p.id, p.name, p.description, p.team_id, p.status,
                p.repository_url, p.start_date, p.created_at, p.updated_at
            FROM projects p
            WHERE {where_clause}
            ORDER BY {sort_field} {sort_order}
            LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}
        """
        projects = await fetch_all(data_query, *params, limit, offset)
        
        if not projects:
            return []
            
        project_ids = [p["id"] for p in projects]
        
        # Fetch technologies for these projects
        tech_query = """
            SELECT 
                pt.id, pt.project_id, pt.technology_id,
                t.name as technology_name,
                pt.version_id,
                tv.version as version_number,
                pt.usage_type, pt.notes, pt.added_at,
                tc.name as category_name,
                ts.name as status
            FROM project_technologies pt
            JOIN technologies t ON pt.technology_id = t.id
            LEFT JOIN technology_versions tv ON pt.version_id = tv.id
            JOIN technology_categories tc ON t.category_id = tc.id
            JOIN technology_statuses ts ON t.status_id = ts.id
            WHERE pt.project_id = ANY($1)
            ORDER BY t.name ASC
        """
        technologies = await fetch_all(tech_query, project_ids)
        
        # Group technologies by project_id
        tech_map = {}
        for tech in technologies:
            pid = tech["project_id"]
            if pid not in tech_map:
                tech_map[pid] = []
            tech_map[pid].append(dict(tech))
            
        # Attach to projects
        results = []
        for p in projects:
            p_dict = dict(p)
            p_dict["technologies"] = tech_map.get(p["id"], [])
            results.append(p_dict)
            
        return results

    @staticmethod
    async def get_project_by_id(project_id: int) -> dict[str, Any] | None:
        query = """
            SELECT 
                id, name, description, team_id, status, repository_url, 
                start_date, created_at, updated_at
            FROM projects
            WHERE id = $1
        """
        project = await fetch_one(query, project_id)
        if project:
            project = dict(project)
            project["technologies"] = await ProjectService.get_project_technologies(project_id)
        return project

    @staticmethod
    async def create_project(project: ProjectCreate) -> dict[str, Any]:
        insert_query = """
            INSERT INTO projects (
                name, description, team_id, status, repository_url, 
                start_date, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING id, name, description, team_id, status, repository_url, 
                start_date, created_at, updated_at
        """
        result = await fetch_one(
            insert_query,
            project.name,
            project.description,
            project.team_id,
            project.status,
            project.repository_url,
            project.start_date,
        )
        
        if result and project.technology_ids:
            project_id = result["id"]
            for tech_id in project.technology_ids:
                await execute(
                    """
                    INSERT INTO project_technologies (project_id, technology_id, usage_type, added_at)
                    VALUES ($1, $2, 'production', NOW())
                    ON CONFLICT (project_id, technology_id) DO NOTHING
                    """,
                    project_id,
                    tech_id
                )
            
            # Fetch technologies to return with project
            result = dict(result)
            result["technologies"] = await ProjectService.get_project_technologies(project_id)
            
        return dict(result) if result else {}

    @staticmethod
    async def update_project(project_id: int, project: ProjectUpdate) -> dict[str, Any] | None:
        update_fields = []
        params = []
        param_count = 0
        
        if project.name is not None:
            param_count += 1
            update_fields.append(f"name = ${param_count}")
            params.append(project.name)
            
        if project.description is not None:
            param_count += 1
            update_fields.append(f"description = ${param_count}")
            params.append(project.description)
            
        if project.team_id is not None:
            param_count += 1
            update_fields.append(f"team_id = ${param_count}")
            params.append(project.team_id)
            
        if project.status is not None:
            param_count += 1
            update_fields.append(f"status = ${param_count}")
            params.append(project.status)
            
        if project.repository_url is not None:
            param_count += 1
            update_fields.append(f"repository_url = ${param_count}")
            params.append(project.repository_url)
            
        if project.start_date is not None:
            param_count += 1
            update_fields.append(f"start_date = ${param_count}")
            params.append(project.start_date)
            
        if update_fields:
            param_count += 1
            query = f"""
                UPDATE projects 
                SET {", ".join(update_fields)}, updated_at = NOW()
                WHERE id = ${param_count}
                RETURNING id
            """
            params.append(project_id)
            await fetch_one(query, *params)
            
        if project.technology_ids is not None:
            current_techs = await ProjectService.get_project_technologies(project_id)
            current_ids = set(t["technology_id"] for t in current_techs)
            new_ids = set(project.technology_ids)
            
            to_add = new_ids - current_ids
            to_remove = current_ids - new_ids
            
            # Remove
            if to_remove:
                await execute(
                    "DELETE FROM project_technologies WHERE project_id = $1 AND technology_id = ANY($2)",
                    project_id,
                    list(to_remove)
                )
                
            # Add
            for tech_id in to_add:
                await execute(
                    """
                    INSERT INTO project_technologies (project_id, technology_id, usage_type, added_at)
                    VALUES ($1, $2, 'production', NOW())
                    ON CONFLICT (project_id, technology_id) DO NOTHING
                    """,
                    project_id,
                    tech_id
                )
                
        return await ProjectService.get_project_by_id(project_id)

    @staticmethod
    async def delete_project(project_id: int) -> None:
        await execute("DELETE FROM projects WHERE id = $1", project_id)

    @staticmethod
    async def get_project_technologies(project_id: int) -> list[dict[str, Any]]:
        query = """
            SELECT 
                pt.id, pt.project_id, pt.technology_id,
                t.name as technology_name,
                pt.version_id,
                tv.version as version_number,
                pt.usage_type, pt.notes, pt.added_at,
                tc.name as category_name,
                ts.name as status
            FROM project_technologies pt
            JOIN technologies t ON pt.technology_id = t.id
            LEFT JOIN technology_versions tv ON pt.version_id = tv.id
            JOIN technology_categories tc ON t.category_id = tc.id
            JOIN technology_statuses ts ON t.status_id = ts.id
            WHERE pt.project_id = $1
            ORDER BY t.name ASC
        """
        return await fetch_all(query, project_id)

    @staticmethod
    async def check_project_technology_duplicate(project_id: int, technology_id: int) -> dict[str, Any] | None:
        return await fetch_one(
            "SELECT id FROM project_technologies WHERE project_id = $1 AND technology_id = $2",
            project_id,
            technology_id,
        )

    @staticmethod
    async def add_technology_to_project(project_id: int, tech: ProjectTechnologyCreate) -> dict[str, Any]:
        insert_query = """
            INSERT INTO project_technologies (
                project_id, technology_id, version_id, usage_type, notes, added_at
            )
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id, project_id, technology_id, version_id, usage_type, notes, added_at
        """
        result = await fetch_one(
            insert_query,
            project_id,
            tech.technology_id,
            tech.version_id,
            tech.usage_type,
            tech.notes,
        )
        return dict(result) if result else {}

    @staticmethod
    async def remove_technology_from_project(project_id: int, technology_id: int) -> None:
        await execute(
            "DELETE FROM project_technologies WHERE project_id = $1 AND technology_id = $2",
            project_id,
            technology_id,
        )

    @staticmethod
    async def preview_archive_candidates(inactive_days: int = 180) -> list[dict[str, Any]]:
        query = "SELECT * FROM archive_inactive_projects($1, true)"
        results = await fetch_all(query, inactive_days)
        return [dict(r) for r in results]

    @staticmethod
    async def execute_archiving(inactive_days: int, user_id: int) -> list[dict[str, Any]]:
        query = "SELECT * FROM archive_inactive_projects($1, false)"
        results = await fetch_all(query, inactive_days)
        
        await execute(
            "UPDATE archive_log SET archived_by = $1 WHERE id = (SELECT MAX(id) FROM archive_log)",
            user_id
        )
        
        return [dict(r) for r in results]

    @staticmethod
    async def get_archive_history(limit: int = 10) -> list[dict[str, Any]]:
        query = "SELECT * FROM get_archive_history($1)"
        results = await fetch_all(query, limit)
        return [dict(r) for r in results]

