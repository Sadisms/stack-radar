import os
from dataclasses import dataclass
from functools import lru_cache


@dataclass
class DatabaseConfig:
    """
    Database connection configuration
    """
    host: str
    port: int
    username: str
    password: str
    database: str
    min_pool_size: int = 5
    max_pool_size: int = 20

    @property
    def dsn(self) -> str:
        return f"postgresql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}"


@dataclass
class AuthConfig:
    """
    Authentication and security configuration
    """
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24


@dataclass
class AppConfig:
    """
    Application configuration
    """
    debug: bool
    allowed_origins: list[str]
    api_v1_prefix: str = "/api/v1"


@dataclass
class Settings:
    """
    Global application settings
    """
    database: DatabaseConfig
    auth: AuthConfig
    app: AppConfig


@lru_cache
def get_settings() -> Settings:
    """
    Load and cache application settings from environment variables
    """
    return Settings(
        database=DatabaseConfig(
            host=os.getenv("POSTGRES_HOST", "localhost"),
            port=int(os.getenv("POSTGRES_PORT", "5432")),
            username=os.getenv("POSTGRES_USER", "postgres"),
            password=os.getenv("POSTGRES_PASSWORD", "postgres"),
            database=os.getenv("POSTGRES_DB", "stack_radar"),
            min_pool_size=int(os.getenv("DB_MIN_POOL_SIZE", "5")),
            max_pool_size=int(os.getenv("DB_MAX_POOL_SIZE", "20")),
        ),
        auth=AuthConfig(
            secret_key=os.getenv("SECRET_KEY", "your-secret-key-change-in-production"),
            algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
            access_token_expire_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")),
        ),
        app=AppConfig(
            debug=os.getenv("DEBUG", "false").lower() == "true",
            allowed_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(","),
        ),
    )
