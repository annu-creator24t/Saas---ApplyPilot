import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware to assign a unique request ID to every incoming request.
    """

    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:
        request.state.request_id = str(uuid.uuid4())

        response = await call_next(request)

        response.headers["X-Request-ID"] = request.state.request_id

        return response