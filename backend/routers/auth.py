from fastapi import APIRouter, Depends, HTTPException, Query, status


from backend.services.auth import AuthService
from backend.core.exceptions import NotFoundException, ValidationException
from backend.core.pagination import PaginatedResponse, PaginationParams, SortParams, paginate
from backend.core.security import create_access_token, verify_password, get_password_hash, get_current_admin_user
from backend.schemas.auth import LoginRequest, LoginResponse, UserListItem, UserResponse, CreateUserRequest, UpdateUserRequest

router = APIRouter(prefix="", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    User authentication endpoint
    
    Args:
        request: Login credentials
        
    Returns:
        Authentication token and user data
        
    Raises:
        HTTPException: If credentials are invalid
    """
    user = await AuthService.get_user_by_email(request.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверные учетные данные"
        )
    
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверные учетные данные"
        )
    
    token = create_access_token({"user_id": user["id"], "email": user["email"]})
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        is_admin=user["is_admin"],
        is_active=user["is_active"],
        created_at=user["created_at"],
        updated_at=user["updated_at"],
    )
    
    return LoginResponse(token=token, user=user_response)


@router.get("/users", response_model=PaginatedResponse[UserListItem])
async def list_users(
    current_user: dict = Depends(get_current_admin_user),
    pagination: PaginationParams = Depends(),
    sort: SortParams = Depends(),
    q: str | None = Query(None, description="Search query"),
    is_admin: bool | None = Query(None, description="Filter by admin status"),
):
    """
    List users with filtering and pagination (admin only)
    
    Args:
        current_user: Current admin user
        pagination: Pagination parameters
        sort: Sort parameters
        q: Search query
        is_admin: Admin filter
        
    Returns:
        Paginated list of users
    """
    
    allowed_sort_fields = {"id": "u.id", "email": "u.email", "full_name": "u.full_name", "created_at": "u.created_at"}
    
    if sort.sort_by not in allowed_sort_fields:
        sort.sort_by = "created_at"
    
    sql_sort_field = allowed_sort_fields[sort.sort_by]
    
    where_conditions = []
    params = []
    param_count = 0
    
    if q:
        param_count += 2
        where_conditions.append(f"(u.email ILIKE ${param_count-1} OR u.full_name ILIKE ${param_count})")
        search_pattern = f"%{q}%"
        params.extend([search_pattern, search_pattern])
    
    if is_admin is not None:
        param_count += 1
        where_conditions.append(f"u.is_admin = ${param_count}")
        params.append(is_admin)
    
    where_clause = " AND ".join(where_conditions) if where_conditions else "TRUE"
    
    total_count = await AuthService.count_users(where_clause, params)
    
    items = await AuthService.list_users(
        where_clause,
        sql_sort_field,
        sort.sort_order.upper(),
        pagination.page_size,
        pagination.offset,
        params
    )
    
    users = [UserListItem(**item) for item in items]
    
    return paginate(users, total_count, pagination, sort)


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """
    Get user by ID
    
    Args:
        user_id: User ID
        
    Returns:
        User data
        
    Raises:
        NotFoundException: If user not found
    """
    user = await AuthService.get_user_by_id(user_id)
    
    if not user:
        raise NotFoundException(f"Пользователь с id={user_id} не найден")
    
    return UserResponse(**user)


@router.post("/users", response_model=UserResponse)
async def create_user(
    request: CreateUserRequest,
    current_user: dict = Depends(get_current_admin_user)
):
    """
    Create new user (admin only)
    
    Args:
        request: User creation data
        current_user: Current admin user
        
    Returns:
        Created user data
        
    Raises:
        ValidationException: If email already exists
    """
    
    # Check if email already exists
    existing = await AuthService.get_user_by_email(request.email)
    if existing:
        raise ValidationException("Пользователь с таким email уже существует")
    
    password_hash = get_password_hash(request.password)
    result = await AuthService.create_user(
        request.email,
        password_hash,
        request.full_name,
        request.is_admin,
        request.is_active
    )
    
    return UserResponse(**result)


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    request: UpdateUserRequest,
    current_user: dict = Depends(get_current_admin_user)
):
    """
    Update user (admin only)
    
    Args:
        user_id: User ID
        request: User update data
        current_user: Current admin user
        
    Returns:
        Updated user data
        
    Raises:
        NotFoundException: If user not found
        ValidationException: If email already taken by another user
    """
    
    # Check if user exists
    existing_user = await AuthService.get_user_by_id(user_id)
    if not existing_user:
        raise NotFoundException(f"Пользователь с id={user_id} не найден")
    
    # Check if email is taken by another user
    email_user = await AuthService.get_user_by_email(request.email)
    if email_user and email_user["id"] != user_id:
        raise ValidationException("Email уже используется другим пользователем")
    
    result = await AuthService.update_user(
        user_id,
        request.email,
        request.full_name,
        request.is_admin,
        request.is_active
    )
    
    return UserResponse(**result)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: dict = Depends(get_current_admin_user)
):
    """
    Delete user (admin only)
    
    Args:
        user_id: User ID
        current_user: Current admin user
        
    Raises:
        NotFoundException: If user not found
        ValidationException: If trying to delete self
    """
    
    # Prevent self-deletion
    if current_user["id"] == user_id:
        raise ValidationException("Нельзя удалить свой собственный аккаунт")
    
    # Check if user exists
    existing_user = await AuthService.get_user_by_id(user_id)
    if not existing_user:
        raise NotFoundException(f"Пользователь с id={user_id} не найден")
    
    await AuthService.delete_user(user_id)


