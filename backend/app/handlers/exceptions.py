class ApplyPilotException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 400,
        error_code: str = "APPLICATION_ERROR",
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code


class AuthenticationException(ApplyPilotException):
    def __init__(self, message="Authentication Failed"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_ERROR",
        )


class AuthorizationException(ApplyPilotException):
    def __init__(self, message="Unauthorized"):
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_ERROR",
        )


class NotFoundException(ApplyPilotException):
    def __init__(self, message="Resource Not Found"):
        super().__init__(
            message=message,
            status_code=404,
            error_code="NOT_FOUND",
        )


class ValidationException(ApplyPilotException):
    def __init__(self, message="Validation Failed"):
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
        )


class AIException(ApplyPilotException):
    def __init__(
        self,
        message="AI Service Failed",
        error_code="AI_SERVICE_ERROR",
    ):
        super().__init__(
            message=message,
            status_code=503,
            error_code=error_code,
        )