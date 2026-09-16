import traceback

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logger import logger
from app.handlers.exceptions import ApplyPilotException


def register_exception_handlers(app: FastAPI) -> None:
    """
    Register all application exception handlers.
    """

    @app.exception_handler(ApplyPilotException)
    async def application_exception_handler(
        request: Request,
        exc: ApplyPilotException,
    ) -> JSONResponse:
        logger.warning(
            "%s %s | %s | %s",
            request.method,
            request.url.path,
            exc.error_code,
            exc.message,
        )

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "status_code": exc.status_code,
                "message": exc.message,
                "error": {
                    "code": exc.error_code,
                    "message": exc.message,
                },
            },
        )

    @app.exception_handler(StarletteHTTPException)
    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        request: Request,
        exc: HTTPException | StarletteHTTPException,
    ) -> JSONResponse:
        logger.warning(
            "%s %s | HTTP_EXCEPTION | %s",
            request.method,
            request.url.path,
            exc.detail,
        )

        message = str(exc.detail) if exc.detail else "Request failed."

        code_map = {
            401: "AUTHENTICATION_ERROR",
            403: "AUTHORIZATION_ERROR",
            404: "NOT_FOUND",
            422: "VALIDATION_ERROR",
            429: "RATE_LIMIT_EXCEEDED",
            503: "SERVICE_UNAVAILABLE",
        }
        error_code = code_map.get(exc.status_code, "HTTP_EXCEPTION")

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "status_code": exc.status_code,
                "message": message,
                "error": {
                    "code": error_code,
                    "message": message,
                },
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        logger.warning(
            "%s %s | VALIDATION_ERROR: %s",
            request.method,
            request.url.path,
            exc.errors(),
        )

        errors = exc.errors()
        messages = []
        for err in errors:
            field = " -> ".join([str(x) for x in err.get("loc", []) if str(x) != "body"])
            msg = err.get("msg", "Invalid value")
            messages.append(f"{field}: {msg}" if field else msg)

        custom_message = "; ".join(messages) if messages else "Validation failed."

        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "status_code": 422,
                "message": custom_message,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": custom_message,
                    "details": errors,
                },
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        logger.exception(
            "Unhandled exception during %s %s: %s",
            request.method,
            request.url.path,
            str(exc),
        )

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "status_code": 500,
                "message": "An unexpected server error occurred. Please try again later.",
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected server error occurred. Please try again later.",
                },
            },
        )