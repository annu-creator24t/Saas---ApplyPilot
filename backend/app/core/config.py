from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ==========================
    # Application
    # ==========================
    APP_NAME: str = "ApplyPilot API"
    APP_VERSION: str = "1.0.0"

    DEBUG: bool = True

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ==========================
    # Database
    # ==========================
    MONGODB_URI: str
    DATABASE_NAME: str

    # ==========================
    # JWT
    # ==========================
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ==========================
    # Gemini AI
    # ==========================
    GEMINI_API_KEY: str
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
    FRONTEND_URL: str = "http://localhost:3000"

    # ==========================
    # Logging
    # ==========================
    LOG_LEVEL: str = "INFO"

    # ==========================
    # File Upload
    # ==========================
    MAX_FILE_SIZE: int = 5 * 1024 * 1024
    ALLOWED_FILE_TYPES: str = "pdf,docx"
    UPLOAD_DIRECTORY: str = "uploads/resumes"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()