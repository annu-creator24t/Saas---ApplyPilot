from pathlib import Path

# =====================================================
# Project Paths
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

LOG_DIR = BASE_DIR / "logs"
UPLOAD_DIR = BASE_DIR / "uploads"
RESUME_UPLOAD_DIR = UPLOAD_DIR / "resumes"

# =====================================================
# API
# =====================================================

API_PREFIX = "/api"

# =====================================================
# Authentication
# =====================================================

ALGORITHM = "HS256"

# =====================================================
# File Upload
# =====================================================

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

ALLOWED_FILE_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}