from typing import Optional


class ApplyPilotException(Exception):
    """
    Base exception for all application-specific errors.
    """

    def __init__(
        self,
        message: str,
        status_code: int = 400,
        error_code: str = "APPLICATION_ERROR",
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code


class AuthenticationException(ApplyPilotException):
    """
    Raised when user authentication fails.
    """

    def __init__(
        self,
        message: str = "Authentication failed.",
    ) -> None:
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_ERROR",
        )


class AuthorizationException(ApplyPilotException):
    """
    Raised when a user is not authorized to access a resource.
    """

    def __init__(
        self,
        message: str = "You are not authorized to perform this action.",
    ) -> None:
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_ERROR",
        )


class NotFoundException(ApplyPilotException):
    """
    Raised when a requested resource does not exist.
    """

    def __init__(
        self,
        message: str = "Resource not found.",
    ) -> None:
        super().__init__(
            message=message,
            status_code=404,
            error_code="NOT_FOUND",
        )


class ValidationException(ApplyPilotException):
    """
    Raised when request validation fails.
    """

    def __init__(
        self,
        message: str = "Validation failed.",
    ) -> None:
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
        )


class AIException(ApplyPilotException):
    """
    Raised when an AI service fails.
    """

    def __init__(
        self,
        message: str = "AI service failed.",
        error_code: str = "AI_SERVICE_ERROR",
    ) -> None:
        super().__init__(
            message=message,
            status_code=503,
            error_code=error_code,
        )


class AIUsageLimitException(ApplyPilotException):
    """
    Raised when a user has exhausted their free AI usage quota.
    """

    def __init__(
        self,
        message: str = "You have used all 3 free AI analyses. Upgrade to ApplyPilot Pro for ₹99/month.",
    ) -> None:
        super().__init__(
            message=message,
            status_code=403,
            error_code="AI_USAGE_LIMIT_REACHED",
        )


class DatabaseException(ApplyPilotException):
    """
    Raised when a database operation fails.
    """

    def __init__(
        self,
        message: str = "Database operation failed.",
    ) -> None:
        super().__init__(
            message=message,
            status_code=500,
            error_code="DATABASE_ERROR",
        )