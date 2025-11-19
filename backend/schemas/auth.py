from datetime import datetime

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """
    Login request model
    """
    email: EmailStr
    password: str


class Token(BaseModel):
    """
    JWT token model
    """
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """
    User response model
    """
    id: int
    email: str
    full_name: str | None = None
    is_admin: bool
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None


class LoginResponse(BaseModel):
    """
    Login response model
    """
    token: str
    user: UserResponse


class UserListItem(BaseModel):
    """
    User list item model
    """
    id: int
    email: str
    full_name: str | None = None
    is_admin: bool
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None


class CreateUserRequest(BaseModel):
    """
    Create user request model
    """
    email: EmailStr
    password: str
    full_name: str
    is_admin: bool = False
    is_active: bool = True


class UpdateUserRequest(BaseModel):
    """
    Update user request model
    """
    email: EmailStr
    full_name: str
    is_admin: bool
    is_active: bool


class UpdatePasswordRequest(BaseModel):
    """
    Update password request model
    """
    password: str


