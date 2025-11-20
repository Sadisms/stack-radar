from fastapi import APIRouter, Depends, Query, status

from backend.core.exceptions import NotFoundException
from backend.core.pagination import PaginatedResponse, PaginationParams, SortParams, paginate
from backend.services.auth import AuthService
from backend.services.teams import TeamService
from backend.schemas.teams import Team, TeamCreate

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=PaginatedResponse[Team])
async def list_teams(
    pagination: PaginationParams = Depends(),
    sort: SortParams = Depends(),
    q: str | None = Query(None, description="Search query"),
):
    """
    List teams with filtering and pagination

    Args:
        pagination: Pagination parameters
        sort: Sort parameters
        q: Search query

    Returns:
        Paginated list of teams
    """
    allowed_sort_fields = {"name": "t.name", "created_at": "t.created_at"}

    if sort.sort_by not in allowed_sort_fields:
        sort.sort_by = "created_at"

    sql_sort_field = allowed_sort_fields[sort.sort_by]

    where_conditions = []
    params = []
    param_count = 0

    if q:
        param_count += 2
        where_conditions.append(f"(t.name ILIKE ${param_count-1} OR t.description ILIKE ${param_count})")
        search_pattern = f"%{q}%"
        params.extend([search_pattern, search_pattern])

    where_clause = " AND ".join(where_conditions) if where_conditions else "TRUE"

    total_count = await TeamService.count_teams(where_clause, params)

    items = await TeamService.list_teams(
        where_clause,
        sql_sort_field,
        sort.sort_order.upper(),
        pagination.page_size,
        pagination.offset,
        params
    )
    teams = [Team(**item) for item in items]

    return paginate(teams, total_count, pagination, sort)


@router.post("", response_model=Team, status_code=status.HTTP_201_CREATED)
async def create_team(team: TeamCreate):
    """
    Create team

    Args:
        team: Team data

    Returns:
        Created team

    Raises:
        NotFoundException: If lead user not found
    """
    if team.lead_id:
        lead_check = await AuthService.get_user_by_id(team.lead_id)
        if not lead_check:
            raise NotFoundException(f"Пользователь с id={team.lead_id} не найден")

    result = await TeamService.create_team(team)

    return Team(**result)


@router.get("/{team_id}", response_model=Team)
async def get_team(team_id: int):
    """
    Get team by ID

    Args:
        team_id: Team ID

    Returns:
        Team data

    Raises:
        NotFoundException: If team not found
    """
    result = await TeamService.get_team_by_id(team_id)

    if not result:
        raise NotFoundException(f"Команда с id={team_id} не найдена")

    return Team(**result)


@router.put("/{team_id}", response_model=Team)
async def update_team(team_id: int, team: TeamCreate):
    """
    Update team

    Args:
        team_id: Team ID
        team: Team data

    Returns:
        Updated team

    Raises:
        NotFoundException: If team or lead user not found
    """
    check = await TeamService.get_team_by_id(team_id)
    if not check:
        raise NotFoundException(f"Команда с id={team_id} не найдена")

    if team.lead_id:
        lead_check = await AuthService.get_user_by_id(team.lead_id)
        if not lead_check:
            raise NotFoundException(f"Пользователь с id={team.lead_id} не найден")

    result = await TeamService.update_team(team_id, team)

    return Team(**result)


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(team_id: int):
    """
    Delete team

    Args:
        team_id: Team ID

    Raises:
        NotFoundException: If team not found
    """
    check = await TeamService.get_team_by_id(team_id)
    if not check:
        raise NotFoundException(f"Команда с id={team_id} не найдена")

    await TeamService.delete_team(team_id)
