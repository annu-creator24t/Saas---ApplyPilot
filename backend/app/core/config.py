from pathlib import Path
from typing import Optional
import re
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ==========================
    # Application
    # ==========================
    APP_NAME: str = "ApplyPilot API"
    APP_VERSION: str = "1.0.0"

    DEBUG: bool = False

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ==========================
    # Database
    # ==========================
    MONGODB_URI: str = ""
    DATABASE_NAME: str = "applypilot_ai"

    # ==========================
    # JWT
    # ==========================
    JWT_SECRET_KEY: str = ""
    JWT_REFRESH_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ==========================
    # Groq AI
    # ==========================
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    # ==========================
    # Gemini AI
    # ==========================
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # ==========================
    # Google OAuth
    # ==========================
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # ==========================
    # Cloudinary
    # ==========================
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # ==========================
    # Frontend
    # ==========================
    FRONTEND_URL: str = "https://applypilot-jet.vercel.app"

    # ==========================
    # Logging
    # ==========================
    LOG_LEVEL: str = "INFO"

    # ==========================
    # File Upload
    # ==========================
    MAX_FILE_SIZE: int = 5 * 1024 * 1024
    ALLOWED_FILE_TYPES: tuple[str, ...] = ("pdf", "docx")
    UPLOAD_DIRECTORY: Path = Path("uploads/resumes")

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @model_validator(mode="after")
    def populate_defaults(self):
        if not self.DATABASE_NAME and self.MONGODB_URI:
            # Attempt to extract db name from MONGODB_URI if available
            match = re.search(r"/([^/?]+)(\?|$)", self.MONGODB_URI)
            if match and match.group(1):
                self.DATABASE_NAME = match.group(1)
            else:
                self.DATABASE_NAME = "applypilot_ai"
        elif not self.DATABASE_NAME:
            self.DATABASE_NAME = "applypilot_ai"

        if not self.JWT_REFRESH_SECRET_KEY and self.JWT_SECRET_KEY:
            self.JWT_REFRESH_SECRET_KEY = self.JWT_SECRET_KEY + "_refresh"

        return self


settings = Settings()