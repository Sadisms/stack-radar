from datetime import date, datetime

from pydantic import BaseModel


class ProjectBase(BaseModel):
    """
    Project base model
    """
    name: str
    description: str | None = None
    team_id: int | None = None
    status: str
    repository_url: str | None = None
    start_date: date | None = None


class ProjectCreate(ProjectBase):
    """
    Project creation model
    """
    pass


class Project(ProjectBase):
    """
    Project response model
    """
    id: int
    created_at: datetime
    updated_at: datetime


class ProjectTechnologyBase(BaseModel):
    """
    Project technology base model
    """
    technology_id: int
    version_id: int | None = None
    usage_type: str
    notes: str | None = None


class ProjectTechnologyCreate(ProjectTechnologyBase):
    """
    Project technology creation model
    """
    pass


class ProjectTechnology(ProjectTechnologyBase):
    """
    Project technology response model
    """
    id: int
    project_id: int
    added_at: datetime


class ProjectTechnologyWithDetails(BaseModel):
    """
    Project technology with details response model
    """
    id: int
    project_id: int
    technology_id: int
    technology_name: str
    version_id: int | None = None
    version_number: str | None = None
    usage_type: str
    notes: str | None = None
    added_at: datetime
    category_name: str
    status: str

