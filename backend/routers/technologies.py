from fastapi import APIRouter, Depends, Query, status

from backend.core.exceptions import ConflictException, NotFoundException
from backend.core.pagination import PaginatedResponse, PaginationParams, SortParams, paginate
from backend.services.technologies import TechnologyService
from backend.schemas.technologies import (
    Technology,
    TechnologyCategory,
    TechnologyCategoryCreate,
    TechnologyCreate,
    TechnologyStats,
    TechnologyStatsResponse,
    TechnologyUpdate,
)

router = APIRouter(prefix="/technologies", tags=["technologies"])


@router.get("/categories", response_model=list[TechnologyCategory])
async def list_technology_categories():
    """
    Get list of technology categories

    Returns:
        List of technology categories
    """
    items = await TechnologyService.list_categories()
    return [TechnologyCategory(**item) for item in items]


@router.post("/categories", response_model=TechnologyCategory, status_code=status.HTTP_201_CREATED)
async def create_technology_category(category: TechnologyCategoryCreate):
    """
    Create technology category

    Args:
        category: Category data

    Returns:
        Created category

    Raises:
        ConflictException: If category with same name exists
    """
    existing = await TechnologyService.get_category_by_name(category.name)
    if existing:
        raise ConflictException(f'Категория с именем "{category.name}" уже существует')

    result = await TechnologyService.create_category(category)
    return TechnologyCategory(**result)


@router.get("/statuses", response_model=list[str])
async def list_technology_statuses():
    """
    Get list of technology statuses

    Returns:
        List of status names
    """
    return await TechnologyService.list_statuses()


@router.post("/statuses", status_code=status.HTTP_201_CREATED)
async def create_technology_status(name: str):
    """
    Create technology status

    Args:
        name: Status name

    Returns:
        Success message

    Raises:
        ConflictException: If status already exists
    """
    existing = await TechnologyService.get_status_by_name(name)
    if existing:
        raise ConflictException(f'Статус "{name}" уже существует')

    await TechnologyService.create_status(name)
    return {"message": "Статус создан"}


@router.get("/stats", response_model=TechnologyStatsResponse)
async def get_technology_stats():
    """
    Get technology usage statistics

    Returns:
        Technology statistics
    """
    items, total_stats = await TechnologyService.get_stats()

    return TechnologyStatsResponse(
        technologies=[TechnologyStats(**item) for item in items],
        summary=total_stats
    )


@router.get("", response_model=PaginatedResponse[Technology])
async def list_technologies(
    pagination: PaginationParams = Depends(),
    sort: SortParams = Depends(),
    q: str | None = Query(None, description="Search query"),
    status: str | None = Query(None, description="Filter by status"),
    category_id: int | None = Query(None, description="Filter by category"),
):
    """
    List technologies with filtering and pagination

    Args:
        pagination: Pagination parameters
        sort: Sort parameters
        q: Search query
        status: Status filter
        category_id: Category filter

    Returns:
        Paginated list of technologies
    """
    allowed_sort_fields = {"name": "t.name", "status": "ts.name", "created_at": "t.created_at"}

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

    if status:
        param_count += 1
        where_conditions.append(f"ts.name = ${param_count}")
        params.append(status)

    if category_id:
        param_count += 1
        where_conditions.append(f"t.category_id = ${param_count}")
        params.append(category_id)

    where_clause = " AND ".join(where_conditions) if where_conditions else "TRUE"

    total_count = await TechnologyService.count_technologies(where_clause, params)

    items = await TechnologyService.list_technologies(
        where_clause,
        sql_sort_field,
        sort.sort_order.upper(),
        pagination.page_size,
        pagination.offset,
        params
    )
    technologies = [Technology(**item) for item in items]

    return paginate(technologies, total_count, pagination, sort)


@router.post("", response_model=Technology, status_code=status.HTTP_201_CREATED)
async def create_technology(tech: TechnologyCreate):
    """
    Create technology

    Args:
        tech: Technology data

    Returns:
        Created technology

    Raises:
        NotFoundException: If category or status not found
    """
    cat_check = await TechnologyService.get_category_by_id(tech.category_id)
    if not cat_check:
        raise NotFoundException(f"Категория с id={tech.category_id} не найдена")

    status_check = await TechnologyService.get_status_by_name(tech.status)
    if not status_check:
        raise NotFoundException(f'Статус "{tech.status}" не найден')

    status_id = status_check["id"]

    result = await TechnologyService.create_technology(tech, status_id)

    result["status"] = tech.status
    result.pop("status_id")

    return Technology(**result)


@router.get("/{tech_id}", response_model=Technology)
async def get_technology(tech_id: int):
    """
    Get technology by ID

    Args:
        tech_id: Technology ID

    Returns:
        Technology data

    Raises:
        NotFoundException: If technology not found
    """
    result = await TechnologyService.get_technology_by_id(tech_id)

    if not result:
        raise NotFoundException(f"Технология с id={tech_id} не найдена")

    return Technology(**result)


@router.put("/{tech_id}", response_model=Technology)
async def update_technology(tech_id: int, tech: TechnologyUpdate):
    """
    Update technology

    Args:
        tech_id: Technology ID
        tech: Technology data

    Returns:
        Updated technology

    Raises:
        NotFoundException: If technology, category or status not found
    """
    check = await TechnologyService.get_technology_simple_by_id(tech_id)
    if not check:
        raise NotFoundException(f"Технология с id={tech_id} не найдена")

    cat_check = await TechnologyService.get_category_by_id(tech.category_id)
    if not cat_check:
        raise NotFoundException(f"Категория с id={tech.category_id} не найдена")

    status_check = await TechnologyService.get_status_by_name(tech.status)
    if not status_check:
        raise NotFoundException(f'Статус "{tech.status}" не найден')

    status_id = status_check["id"]

    result = await TechnologyService.update_technology(tech_id, tech, status_id)

    result["status"] = tech.status
    result.pop("status_id")

    return Technology(**result)


@router.delete("/{tech_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_technology(tech_id: int):
    """
    Delete technology

    Args:
        tech_id: Technology ID

    Raises:
        NotFoundException: If technology not found
    """
    check = await TechnologyService.get_technology_simple_by_id(tech_id)
    if not check:
        raise NotFoundException(f"Технология с id={tech_id} не найдена")

    await TechnologyService.delete_technology(tech_id)
