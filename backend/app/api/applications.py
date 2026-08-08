from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.dependencies import get_current_user
from app.schemas.application import JobApplicationCreate, JobApplicationUpdate
from app.schemas.common import APIResponse
from app.services.application_service import ApplicationService

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)

service = ApplicationService()


@router.post(
    "",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Application",
    description="Save/Track a new job application.",
)
async def create_application(
    data: JobApplicationCreate,
    current_user: dict = Depends(get_current_user),
):
    return await service.create_application(
        user_id=str(current_user["_id"]),
        data=data,
    )


@router.get(
    "",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Get All User Applications",
    description="Retrieve all tracked job applications for current user.",
)
async def get_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user),
):
    return await service.get_user_applications(
        user_id=str(current_user["_id"]),
        status=status_filter,
    )


@router.get(
    "/{application_id}",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Application Details",
)
async def get_application(
    application_id: str,
    current_user: dict = Depends(get_current_user),
):
    return await service.get_application(
        application_id=application_id,
        user_id=str(current_user["_id"]),
    )


@router.patch(
    "/{application_id}",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Application",
)
async def update_application(
    application_id: str,
    data: JobApplicationUpdate,
    current_user: dict = Depends(get_current_user),
):
    return await service.update_application(
        application_id=application_id,
        user_id=str(current_user["_id"]),
        data=data,
    )


@router.delete(
    "/{application_id}",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Application",
)
async def delete_application(
    application_id: str,
    current_user: dict = Depends(get_current_user),
):
    return await service.delete_application(
        application_id=application_id,
        user_id=str(current_user["_id"]),
    )
