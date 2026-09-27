"""
Application configuration.

Loaded from environment variables / .env file. Never hardcode secrets or
machine-specific paths here — see .env.example for the full list of
supported settings.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "RTB's Tech"
    database_url: str = "sqlite:///./rtb_tech.db"
    python_executable: str = "python"
    execution_timeout: int = 5  # seconds
    max_code_size: int = 50_000  # characters
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
