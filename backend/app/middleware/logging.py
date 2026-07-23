import time

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

from app.core.logger import logger


class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):

        start_time = time.perf_counter()

        response = await call_next(request)

        process_time = round(
            (time.perf_counter() - start_time) * 1000,
            2,
        )

        logger.info(
            "%s %s | %s | %.2f ms",
            request.method,
            request.url.path,
            response.status_code,
            process_time,
        )

        return response