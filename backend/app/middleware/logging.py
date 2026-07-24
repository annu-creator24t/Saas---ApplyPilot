import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logger import logger


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log incoming requests and their processing time.
    """

    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:
        start_time = time.perf_counter()

        try:
            response = await call_next(request)
        finally:
            process_time = (
                time.perf_counter() - start_time
            ) * 1000

            status_code = (
                response.status_code
                if "response" in locals()
                else 500
            )

            logger.info(
                "%s %s | %s | %.2f ms",
                request.method,
                request.url.path,
                status_code,
                process_time,
            )

        return response