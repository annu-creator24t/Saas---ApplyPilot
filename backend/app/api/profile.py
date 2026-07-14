from fastapi import APIRouter

router = APIRouter()


@router.get("/profile")
async def get_profile():
    return {
        "success": True,
        "message": "Profile API working."
    }