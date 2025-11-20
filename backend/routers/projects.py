from fastapi import APIRouter, Depends, Query, status

from backend.core.exceptions import ConflictException, NotFoundException
from backend.core.pagination import PaginatedResponse, PaginationParams, SortParams, paginate
from backend.services.projects import ProjectService
from backend.services.teams import TeamService
from backend.services.technologies import TechnologyService
from backend.schemas.projects import (
    Project,
    ProjectCreate,
    ProjectUpdate,
    ProjectTechnology,
    ProjectTechnologyCreate,
    ProjectTechnologyWithDetails,
)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=PaginatedResponse[Project])
async def list_projects(
    pagination: PaginationParams = Depends(),
    sort: SortParams = Depends(),
    q: str | None = Query(None, description="Search query"),
    status: str | None = Query(None, description="Filter by status"),
    team_id: int | None = Query(None, description="Filter by team"),
):
    """
    List projects with filtering and pagination
    
    Args:
        pagination: Pagination parameters
        sort: Sort parameters
        q: Search query
        status: Status filter
        team_id: Team filter
        
    Returns:
        Paginated list of projects
    """
    allowed_sort_fields = {
        "name": "p.name",
        "status": "p.status",
        "created_at": "p.created_at",
        "team_id": "p.team_id",
    }
    
    if sort.sort_by not in allowed_sort_fields:
        sort.sort_by = "created_at"
    
    sql_sort_field = allowed_sort_fields[sort.sort_by]
    
    where_conditions = []
    params = []
    param_count = 0
    
    if q:
        param_count += 2
        where_conditions.append(f"(p.name ILIKE ${param_count-1} OR p.description ILIKE ${param_count})")
        search_pattern = f"%{q}%"
        params.extend([search_pattern, search_pattern])
    
    if status:
        param_count += 1
        where_conditions.append(f"p.status = ${param_count}")
        params.append(status)
    
    if team_id:
        param_count += 1
        where_conditions.append(f"p.team_id = ${param_count}")
        params.append(team_id)
    
    where_clause = " AND ".join(where_conditions) if where_conditions else "TRUE"
    
    where_clause = " AND ".join(where_conditions) if where_conditions else "TRUE"
    
    total_count = await ProjectService.count_projects(where_clause, params)
    
    items = await ProjectService.list_projects(
        where_clause,
        sql_sort_field,
        sort.sort_order.upper(),
        pagination.page_size,
        pagination.offset,
        params
    )
    projects = [Project(**item) for item in items]
    
    return paginate(projects, total_count, pagination, sort)


@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate):
    """
    Create project
    
    Args:
        project: Project data
        
    Returns:
        Created project
        
    Raises:
        NotFoundException: If team not found
    """
    if project.team_id:
        team_check = await TeamService.get_team_by_id(project.team_id)
        if not team_check:
            raise NotFoundException(f"Команда с id={project.team_id} не найдена")
    
    result = await ProjectService.create_project(project)
    
    return Project(**result)


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: int):
    """
    Get project by ID
    
    Args:
        project_id: Project ID
        
    Returns:
        Project data
        
    Raises:
        NotFoundException: If project not found
    """
    result = await ProjectService.get_project_by_id(project_id)
    
    if not result:
        raise NotFoundException(f"Проект с id={project_id} не найден")
    
    return Project(**result)


@router.put("/{project_id}", response_model=Project)
async def update_project(project_id: int, project: ProjectUpdate):
    """
    Update project
    
    Args:
        project_id: Project ID
        project: Project update data
        
    Returns:
        Updated project
        
    Raises:
        NotFoundException: If project not found
    """
    check = await ProjectService.get_project_by_id(project_id)
    if not check:
        raise NotFoundException(f"Проект с id={project_id} не найден")
        
    if project.team_id:
        team_check = await TeamService.get_team_by_id(project.team_id)
        if not team_check:
            raise NotFoundException(f"Команда с id={project.team_id} не найдена")
            
    result = await ProjectService.update_project(project_id, project)
    
    return Project(**result)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: int):
    """
    Delete project
    
    Args:
        project_id: Project ID
        
    Raises:
        NotFoundException: If project not found
    """
    check = await ProjectService.get_project_by_id(project_id)
    if not check:
        raise NotFoundException(f"Проект с id={project_id} не найден")
    
    await ProjectService.delete_project(project_id)


@router.get("/{project_id}/technologies", response_model=list[ProjectTechnologyWithDetails])
async def get_project_technologies(project_id: int):
    """
    Get project technologies
    
    Args:
        project_id: Project ID
        
    Returns:
        List of project technologies
        
    Raises:
        NotFoundException: If project not found
    """
    check = await ProjectService.get_project_by_id(project_id)
    if not check:
        raise NotFoundException(f"Проект с id={project_id} не найден")
    
    items = await ProjectService.get_project_technologies(project_id)
    
    return [ProjectTechnologyWithDetails(**item) for item in items]


@router.post("/{project_id}/technologies", response_model=ProjectTechnology, status_code=status.HTTP_201_CREATED)
async def add_technology_to_project(project_id: int, tech: ProjectTechnologyCreate):
    """
    Add technology to project
    
    Args:
        project_id: Project ID
        tech: Technology data
        
    Returns:
        Created project technology
        
    Raises:
        NotFoundException: If project, technology or version not found
        ConflictException: If technology already added to project
    """
    check = await ProjectService.get_project_by_id(project_id)
    if not check:
        raise NotFoundException(f"Проект с id={project_id} не найден")
    
    tech_check = await TechnologyService.get_technology_simple_by_id(tech.technology_id)
    if not tech_check:
        raise NotFoundException(f"Технология с id={tech.technology_id} не найдена")
    
    if tech.version_id:
        version_check = await TechnologyService.get_version_by_id(tech.version_id, tech.technology_id)
        if not version_check:
            raise NotFoundException(f"Версия с id={tech.version_id} не найдена для этой технологии")
    
    duplicate_check = await ProjectService.check_project_technology_duplicate(project_id, tech.technology_id)
    if duplicate_check:
        raise ConflictException("Эта технология уже добавлена в проект")
    
    result = await ProjectService.add_technology_to_project(project_id, tech)
    
    return ProjectTechnology(**result)


@router.delete("/{project_id}/technologies/{technology_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_technology_from_project(project_id: int, technology_id: int):
    """
    Remove technology from project
    
    Args:
        project_id: Project ID
        technology_id: Technology ID
        
    Raises:
        NotFoundException: If project technology relation not found
    """
    check = await ProjectService.check_project_technology_duplicate(project_id, technology_id)
    if not check:
        raise NotFoundException("Связь между проектом и технологией не найдена")
    
    await ProjectService.remove_technology_from_project(project_id, technology_id)

