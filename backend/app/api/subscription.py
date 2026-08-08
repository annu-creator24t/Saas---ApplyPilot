from fastapi import APIRouter, Depends, Header, status

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.handlers.exceptions import AuthorizationException
from app.schemas.common import APIResponse
from app.schemas.subscription import (
    AdminApprovePaymentRequest,
    SubmitPaymentRequest,
)
from app.services.subscription_service import SubscriptionService

router = APIRouter(
    prefix="/subscription",
    tags=["Subscription"],
)

service = SubscriptionService()


@router.get(
    "/status",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Subscription Status",
    description="Fetch current plan, usage credits, and payment status for authenticated user.",
)
async def get_subscription_status(
    current_user: dict = Depends(get_current_user),
):
    return await service.get_subscription_status(
        user_id=str(current_user["_id"])
    )


@router.post(
    "/submit-payment",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit Manual Payment Confirmation",
    description="Submit payment confirmation after scanning UPI QR Code.",
)
async def submit_payment(
    request: SubmitPaymentRequest,
    current_user: dict = Depends(get_current_user),
):
    return await service.submit_manual_payment(
        user_id=str(current_user["_id"]),
        upi_reference=request.upi_reference,
    )


@router.post(
    "/admin/approve",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin Approve Subscription",
    description="Manually approve payment and activate user Pro subscription for 30 days.",
)
async def admin_approve_subscription(
    request: AdminApprovePaymentRequest,
    x_admin_secret: str = Header(None, alias="X-Admin-Secret"),
):
    # Verify admin secret key
    admin_secret = getattr(settings, "ADMIN_SECRET_KEY", "applypilot_secret_admin_key_2026")
    if not x_admin_secret or x_admin_secret != admin_secret:
        raise AuthorizationException("Invalid admin authorization key.")

    return await service.admin_approve_subscription(
        user_id=request.user_id,
        duration_days=request.duration_days,
    )
