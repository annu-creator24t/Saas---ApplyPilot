import traceback

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

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
                "error": {
                    "code": exc.error_code,
                    "message": exc.message,
                },
            },
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        request: Request,
        exc: HTTPException,
    ) -> JSONResponse:
        logger.warning(
            "%s %s | HTTP_EXCEPTION | %s",
            request.method,
            request.url.path,
            exc.detail,
        )

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "status_code": exc.status_code,
                "error": {
                    "code": "HTTP_EXCEPTION",
                    "message": exc.detail,
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

        logger.debug(traceback.format_exc())

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "status_code": 500,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": f"An unexpected error occurred: {type(exc).__name__} - {str(exc)}",
                    "traceback": traceback.format_exc(),
                },
            },
        )