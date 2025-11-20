from fastapi import Request, status
from fastapi.responses import JSONResponse


class APIException(Exception):
    """
    Base API exception
    """
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(APIException):
    """
    Resource not found exception
    """
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND)


class ValidationException(APIException):
    """
    Validation error exception
    """
    def __init__(self, message: str = "Validation error", errors: dict | None = None):
        self.errors = errors
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)


class ConflictException(APIException):
    """
    Resource conflict exception
    """
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status_code=status.HTTP_409_CONFLICT)


async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
    """
    Handle API exceptions

    Args:
        request: Request object
        exc: Exception instance

    Returns:
        JSON error response
    """
    content = {"message": exc.message}
    if isinstance(exc, ValidationException) and exc.errors:
        content["errors"] = exc.errors

    return JSONResponse(
        status_code=exc.status_code,
        content=content,
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle general exceptions

    Args:
        request: Request object
        exc: Exception instance

    Returns:
        JSON error response
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": f"Internal server error: {str(exc)}"},
    )
