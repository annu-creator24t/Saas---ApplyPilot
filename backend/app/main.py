from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, status

from app.api import api_router
from app.core.config import settings
from app.core.cors import setup_cors
from app.core.logger import logger
from app.core.startup import validate_startup
from app.db.connection import (
    close_mongodb_connection,
    connect_to_mongodb,
)
from app.handlers import register_exception_handlers
from app.middleware import (
    LoggingMiddleware,
    RequestIDMiddleware,
    SecurityHeadersMiddleware,
)
from app.schemas.common import APIResponse


@asynccontextmanager
async def lifespan(
    app: FastAPI,
) -> AsyncIterator[None]:
    """
    Manage application startup and shutdown events.
    """
    validate_startup()

    logger.info("Connecting to MongoDB...")
    await connect_to_mongodb()

    logger.info("Application started.")

    yield

    logger.info("Closing MongoDB...")
    await close_mongodb_connection()

    logger.info("Application shutdown.")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI-powered resume analysis, ATS scoring, interview "
        "preparation, cover letter generation, and resume "
        "improvement platform."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS
setup_cors(app)

# Register Middleware
app.add_middleware(RequestIDMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LoggingMiddleware)

# Register Exception Handlers
register_exception_handlers(app)

# Register API Routes
app.include_router(api_router)


@app.get(
    "/",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="API Status",
    description="Verify that the ApplyPilot API is running.",
    tags=["Health"],
)
async def root() -> APIResponse:
    return APIResponse(
        message="ApplyPilot API is running.",
        data={
            "version": settings.APP_VERSION,
        },
    )


@app.get(
    "/health",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Check whether the API is healthy.",
    tags=["Health"],
)
async def health() -> APIResponse:
    return APIResponse(
        message="Healthy",
        data={
            "status": "UP",
            "version": settings.APP_VERSION,
        },
    )