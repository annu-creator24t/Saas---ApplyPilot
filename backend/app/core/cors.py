from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


def setup_cors(app: FastAPI) -> None:
    """
    Configure Cross-Origin Resource Sharing (CORS) middleware to support
    frontend application, browser extension, and development servers.
    """
    raw_frontend_urls = [url.strip().rstrip("/") for url in settings.FRONTEND_URL.split(",") if url.strip()]
    origins = list(set([
        *raw_frontend_urls,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]))

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^(chrome|moz|edge)-extension://.*$|^https://.*\.vercel\.app$|^https://.*\.onrender\.com$|^https://.*\.pages\.dev$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )