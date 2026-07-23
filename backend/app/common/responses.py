from typing import Any

from fastapi.responses import JSONResponse
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    code: str
    message: str


class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Any | None = None
    error: ErrorResponse | None = None


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200,
):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data,
            "error": None,
        },
    )


def error_response(
    message: str,
    code: str = "ERROR",
    status_code: int = 400,
):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": None,
            "data": None,
            "error": {
                "code": code,
                "message": message,
            },
        },
    )