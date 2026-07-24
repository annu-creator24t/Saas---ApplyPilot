import logging

from app.core.constants import LOG_DIR

# Ensure the log directory exists
LOG_DIR.mkdir(parents=True, exist_ok=True)

logger = logging.getLogger("applypilot")
logger.setLevel(logging.INFO)
logger.propagate = False

formatter = logging.Formatter(
    "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)

console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)

file_handler = logging.FileHandler(
    LOG_DIR / "app.log",
    encoding="utf-8",
)
file_handler.setFormatter(formatter)

if not logger.handlers:
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)