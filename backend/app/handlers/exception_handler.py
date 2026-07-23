from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.handlers.exceptions import ApplyPilotException


def register_exception_handlers(app: FastAPI):

    @app.exception_handler(ApplyPilotException)
    async def application_exception_handler(
        request: Request,
        exc: ApplyPilotException,
    ):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.error_code,
                    "message": exc.message,
                },
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(
        request: Request,
        exc: Exception,
    ):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "Something went wrong.",
                },
            },
        )