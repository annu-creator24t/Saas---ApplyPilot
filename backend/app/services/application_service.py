from datetime import datetime
from typing import Optional
from app.handlers.exceptions import AuthorizationException, NotFoundException
from app.repositories.application_repository import ApplicationRepository
from app.schemas.application import JobApplicationCreate, JobApplicationUpdate
from app.schemas.common import APIResponse


class ApplicationService:

    def __init__(self):
        self.repo = ApplicationRepository()

    async def create_application(
        self,
        user_id: str,
        data: JobApplicationCreate,
    ) -> APIResponse:
        payload = data.model_dump()
        payload["user_id"] = user_id
        payload["created_at"] = datetime.utcnow()
        payload["updated_at"] = datetime.utcnow()

        if not payload.get("applied_date"):
            payload["applied_date"] = datetime.utcnow()

        app_id = await self.repo.create_application(payload)
        created = await self.repo.get_application(app_id)

        return APIResponse(
            message="Application saved successfully.",
            data=created,
        )

    async def get_user_applications(
        self,
        user_id: str,
        status: Optional[str] = None,
    ) -> APIResponse:
        applications = await self.repo.get_user_applications(user_id, status=status)
        return APIResponse(
            message="Applications fetched successfully.",
            data=applications,
        )

    async def get_application(
        self,
        application_id: str,
        user_id: str,
    ) -> APIResponse:
        app_data = await self.repo.get_application(application_id)
        if not app_data:
            raise NotFoundException("Application not found.")

        if str(app_data.get("user_id")) != str(user_id):
            raise AuthorizationException("Unauthorized.")

        return APIResponse(
            message="Application fetched successfully.",
            data=app_data,
        )

    async def update_application(
        self,
        application_id: str,
        user_id: str,
        data: JobApplicationUpdate,
    ) -> APIResponse:
        existing = await self.repo.get_application(application_id)
        if not existing:
            raise NotFoundException("Application not found.")

        if str(existing.get("user_id")) != str(user_id):
            raise AuthorizationException("Unauthorized.")

        updates = {k: v for k, v in data.model_dump().items() if v is not None}
        await self.repo.update_application(application_id, updates)

        updated = await self.repo.get_application(application_id)
        return APIResponse(
            message="Application updated successfully.",
            data=updated,
        )

    async def delete_application(
        self,
        application_id: str,
        user_id: str,
    ) -> APIResponse:
        deleted = await self.repo.delete_application(application_id, user_id)
        if not deleted:
            raise NotFoundException("Application not found or unauthorized.")

        return APIResponse(
            message="Application deleted successfully.",
        )
