from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import get_settings
from backend.core.database import Database
from backend.core.exceptions import APIException, api_exception_handler, general_exception_handler
from backend.routers import auth, projects, teams, technologies, dashboard, admin


@asynccontextmanager
async def lifespan(_: FastAPI):
    """
    Application lifespan manager
    
    Handles startup and shutdown events
    """
    await Database.connect()
    yield
    await Database.disconnect()


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application
    
    Returns:
        Configured FastAPI instance
    """
    settings = get_settings()
    
    app = FastAPI(
        title="Stack Radar API",
        description="Modern API for technology stack tracking",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.app.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_exception_handler(APIException, api_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    api_prefix = settings.app.api_v1_prefix
    
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(technologies.router, prefix=f"{api_prefix}")
    app.include_router(projects.router, prefix=f"{api_prefix}")
    app.include_router(teams.router, prefix=f"{api_prefix}")
    app.include_router(dashboard.router, prefix=f"{api_prefix}")
    app.include_router(admin.router, prefix=f"{api_prefix}")
    
    @app.get("/")
    async def root():
        """
        Root endpoint
        """
        return {"message": "Stack Radar API", "version": "1.0.0"}
    
    @app.get("/health")
    async def health():
        """
        Health check endpoint
        """
        return {"status": "healthy"}
    
    return app


app = create_app()
