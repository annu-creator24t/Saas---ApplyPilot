from fastapi import APIRouter

router = APIRouter()


@router.get("/history")
async def get_history():
    return {
        "success": True,
        "message": "History API working."
    }