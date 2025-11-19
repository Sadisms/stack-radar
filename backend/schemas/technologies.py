from datetime import datetime

from pydantic import BaseModel


class TechnologyCategoryBase(BaseModel):
    """
    Technology category base model
    """
    name: str
    description: str | None = None
    icon: str | None = None


class TechnologyCategoryCreate(TechnologyCategoryBase):
    """
    Technology category creation model
    """
    pass


class TechnologyCategory(TechnologyCategoryBase):
    """
    Technology category response model
    """
    id: int
    created_at: datetime


class TechnologyBase(BaseModel):
    """
    Technology base model
    """
    name: str
    category_id: int
    description: str | None = None
    official_website: str | None = None
    status: str


class TechnologyCreate(TechnologyBase):
    """
    Technology creation model
    """
    pass


class TechnologyUpdate(TechnologyBase):
    """
    Technology update model
    """
    pass


class Technology(TechnologyBase):
    """
    Technology response model
    """
    id: int
    created_at: datetime
    updated_at: datetime


class TechnologyStats(BaseModel):
    """
    Technology statistics model
    """
    id: int
    name: str
    status: str
    category: str
    project_count: int
    production_count: int
    development_count: int
    testing_count: int


class TechnologyStatsResponse(BaseModel):
    """
    Technology statistics response model
    """
    technologies: list[TechnologyStats]
    summary: dict

