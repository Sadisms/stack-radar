from datetime import datetime, timedelta
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from backend.config import get_settings
from backend.core.database import fetch_one

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against hash
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password
        
    Returns:
        True if password matches
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash password
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password
    """
    return pwd_context.hash(password)


def create_access_token(data: dict[str, Any]) -> str:
    """
    Create JWT access token
    
    Args:
        data: Data to encode in token
        
    Returns:
        Encoded JWT token
    """
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.auth.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.auth.secret_key, algorithm=settings.auth.algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate JWT token
    
    Args:
        token: JWT token
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid
    """
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.auth.secret_key, algorithms=[settings.auth.algorithm])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict[str, Any]:
    """
    Get current authenticated user from JWT token
    
    Args:
        credentials: HTTP authorization credentials
        
    Returns:
        User data
        
    Raises:
        HTTPException: If user not found or token invalid
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    query = """
        SELECT 
            id, email, password_hash, full_name,
            is_admin, is_active, created_at, updated_at
        FROM users
        WHERE id = $1 AND is_active = TRUE
    """
    user = await fetch_one(query, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_active_user(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    """
    Get current active user
    
    Args:
        current_user: Current user from token
        
    Returns:
        User data
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.get("is_active"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user


async def get_current_admin_user(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    """
    Get current admin user
    
    Args:
        current_user: Current user from token
        
    Returns:
        User data
        
    Raises:
        HTTPException: If user is not admin
    """
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges"
        )
    return current_user

