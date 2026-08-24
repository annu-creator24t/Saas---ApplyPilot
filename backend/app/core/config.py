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
    MONGODB_URI: str = "mongodb+srv://applypilot:monika%402005t@cluster0.gksahli.mongodb.net/applypilot_ai?retryWrites=true&w=majority&appName=Cluster0"
    DATABASE_NAME: str = "applypilot_ai"

    # ==========================
    # JWT
    # ==========================
    JWT_SECRET_KEY: str = "8347c19b2912eef77d5f1369eefd3b32381ed7882152df15f6f525f3a20f016a"
    JWT_REFRESH_SECRET_KEY: str = "6d27aeb9ab3ad46f95a87482045efa2f915a1419476127cbb8385f7855389953"
    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ==========================
    # Groq AI
    # ==========================
    GROQ_API_KEY: str = "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"
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    # ==========================
    # Gemini AI
    # ==========================
    GEMINI_API_KEY: str = "AQ.Ab8RN6LZQfUrx0afY6U1hl_zGg-8zlJGA4dAhh-p8UuTpT1AQw"
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # ==========================
    # Google OAuth
    # ==========================
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # ==========================
    # Cloudinary
    # ==========================
    CLOUDINARY_CLOUD_NAME: str = "qatocovx"
    CLOUDINARY_API_KEY: str = "356476672324894"
    CLOUDINARY_API_SECRET: str = "F06-ohUA4PhHXwyw7bic_6DNj0E"

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
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    @model_validator(mode="after")
    def populate_defaults(self):
        if not self.DATABASE_NAME:
            # Attempt to extract db name from MONGODB_URI if available
            match = re.search(r"/([^/?]+)(\?|$)", self.MONGODB_URI)
            if match and match.group(1):
                self.DATABASE_NAME = match.group(1)
            else:
                self.DATABASE_NAME = "applypilot_ai"

        if not self.JWT_REFRESH_SECRET_KEY:
            if self.JWT_SECRET_KEY:
                self.JWT_REFRESH_SECRET_KEY = self.JWT_SECRET_KEY + "_refresh"
            else:
                self.JWT_REFRESH_SECRET_KEY = "6d27aeb9ab3ad46f95a87482045efa2f915a1419476127cbb8385f7855389953"

        if not self.JWT_SECRET_KEY:
            self.JWT_SECRET_KEY = "8347c19b2912eef77d5f1369eefd3b32381ed7882152df15f6f525f3a20f016a"

        return self


settings = Settings()