from math import ceil
from typing import Any, Generic, TypeVar

from fastapi import Query
from pydantic import BaseModel

T = TypeVar("T")


class PaginationParams:
    """
    Pagination query parameters
    """
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        page_size: int = Query(20, ge=1, le=100, description="Page size"),
    ):
        self.page = page
        self.page_size = page_size
        self.offset = (page - 1) * page_size


class SortParams:
    """
    Sorting query parameters
    """
    def __init__(
        self,
        sort_by: str = Query("created_at", description="Sort field"),
        sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    ):
        self.sort_by = sort_by
        self.sort_order = sort_order.lower()


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Paginated response model
    """
    items: list[T]
    page: int
    page_size: int
    total: int
    total_pages: int
    sort_by: str
    sort_order: str


def paginate(
    items: list[T],
    total: int,
    pagination: PaginationParams,
    sort_params: SortParams,
) -> PaginatedResponse[T]:
    """
    Create paginated response
    
    Args:
        items: List of items
        total: Total number of items
        pagination: Pagination parameters
        sort_params: Sort parameters
        
    Returns:
        Paginated response
    """
    total_pages = ceil(total / pagination.page_size) if pagination.page_size > 0 else 0
    
    return PaginatedResponse(
        items=items,
        page=pagination.page,
        page_size=pagination.page_size,
        total=total,
        total_pages=total_pages,
        sort_by=sort_params.sort_by,
        sort_order=sort_params.sort_order,
    )

