from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

APP_NAME = "ApplyPilot API"
APP_VERSION = "1.0.0"

API_PREFIX = "/api"

ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

ALGORITHM = "HS256"

LOG_DIR = BASE_DIR / "logs"
UPLOAD_DIR = BASE_DIR / "uploads"
RESUME_UPLOAD_DIR = UPLOAD_DIR / "resumes"

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

ALLOWED_FILE_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}