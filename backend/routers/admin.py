from fastapi import APIRouter, Depends, HTTPException
from backend.services.projects import ProjectService
from backend.core.security import get_current_active_user

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: dict = Depends(get_current_active_user)):
    """Dependency to ensure user is admin"""
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/archive/preview")
async def preview_archive(
    inactive_days: int = 180,
    admin_user: dict = Depends(require_admin)
):
    """
    Preview projects that would be archived
    
    Args:
        inactive_days: Number of days of inactivity threshold
        admin_user: Current admin user (from dependency)
        
    Returns:
        Count and list of projects that would be archived
    """
    candidates = await ProjectService.preview_archive_candidates(inactive_days)
    return {
        "count": len(candidates),
        "inactive_days": inactive_days,
        "projects": candidates
    }


@router.post("/archive/execute")
async def execute_archive(
    inactive_days: int = 180,
    admin_user: dict = Depends(require_admin)
):
    """
    Execute archiving of inactive projects
    
    Args:
        inactive_days: Number of days of inactivity threshold
        admin_user: Current admin user (from dependency)
        
    Returns:
        Success status and list of archived projects
    """
    archived = await ProjectService.execute_archiving(inactive_days, admin_user["id"])
    return {
        "success": True,
        "count": len(archived),
        "archived_projects": archived
    }


@router.get("/archive/history")
async def archive_history(
    limit: int = 10,
    admin_user: dict = Depends(require_admin)
):
    """
    Get archive operation history
    
    Args:
        limit: Maximum number of history entries to return
        admin_user: Current admin user (from dependency)
        
    Returns:
        List of recent archiving operations
    """
    history = await ProjectService.get_archive_history(limit)
    return {"history": history}
