from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    gemini_model_fast: str = Field(default="gemini-2.5-flash", alias="GEMINI_MODEL_FAST")
    gemini_model_pro: str = Field(default="gemini-2.5-pro", alias="GEMINI_MODEL_PRO")

    google_application_credentials: str = Field(default="", alias="GOOGLE_APPLICATION_CREDENTIALS")
    google_cloud_project: str = Field(default="", alias="GOOGLE_CLOUD_PROJECT")

    livekit_url: str = Field(default="", alias="LIVEKIT_URL")
    livekit_api_key: str = Field(default="", alias="LIVEKIT_API_KEY")
    livekit_api_secret: str = Field(default="", alias="LIVEKIT_API_SECRET")

    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=8000, alias="APP_PORT")
    cors_origins: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")

    chroma_path: str = Field(default="./data/chroma", alias="CHROMA_PATH")
    embedding_model: str = Field(default="gemini-embedding-001", alias="EMBEDDING_MODEL")
    results_db: str = Field(default="./data/results.db", alias="RESULTS_DB")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def chroma_path_abs(self) -> Path:
        p = Path(self.chroma_path)
        return p if p.is_absolute() else (BACKEND_ROOT / p)

    @property
    def results_db_abs(self) -> Path:
        p = Path(self.results_db)
        return p if p.is_absolute() else (BACKEND_ROOT / p)


@lru_cache
def get_settings() -> Settings:
    return Settings()
