from datetime import datetime

from pydantic import BaseModel


class TeamBase(BaseModel):
    """
    Team base model
    """
    name: str
    description: str | None = None
    lead_id: int | None = None


class TeamCreate(TeamBase):
    """
    Team creation model
    """
    pass


class Team(TeamBase):
    """
    Team response model
    """
    id: int
    created_at: datetime
    updated_at: datetime
