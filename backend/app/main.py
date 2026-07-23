from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import api_router

from app.core.config import settings
from app.core.cors import setup_cors
from app.core.logger import logger
from app.core.startup import validate_startup

from app.db.connection import (
    connect_to_mongodb,
    close_mongodb_connection,
)

from app.handlers import register_exception_handlers

from app.middleware import (
    LoggingMiddleware,
    RequestIDMiddleware,
    SecurityHeadersMiddleware,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_startup()

    logger.info("Connecting to MongoDB...")
    await connect_to_mongodb()

    logger.info("Application Started")

    yield

    logger.info("Closing MongoDB...")
    await close_mongodb_connection()

    logger.info("Application Shutdown")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
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


@app.get("/")
async def root():
    return {
        "message": "ApplyPilot API Running 🚀"
    }