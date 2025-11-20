from fastapi import APIRouter, Depends
from backend.services.dashboard import DashboardService
from backend.core.security import get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_active_user)):
    """
    Get all dashboard statistics

    Args:
        current_user: Current authenticated user

    Returns:
        Dashboard statistics including:
        - Overview: total counts
        - Technology usage
        - Project status distribution
        - Recent projects
        - Team summary
        - Technology by category
    """
    overview = await DashboardService.get_overview_stats()
    tech_usage = await DashboardService.get_technology_usage()
    project_status = await DashboardService.get_project_status_distribution()
    recent_projects = await DashboardService.get_recent_projects()
    team_summary = await DashboardService.get_team_summary()
    tech_by_category = await DashboardService.get_technology_by_category()

    return {
        "overview": overview,
        "technology_usage": tech_usage,
        "project_status_distribution": project_status,
        "recent_projects": recent_projects,
        "team_summary": team_summary,
        "technology_by_category": tech_by_category
    }
